import { z } from "zod";
import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import * as chat from "@/lib/chat";
import { prisma } from "@/lib/prisma";
import { getOpenAIClient, OPENAI_CHAT_MODEL } from "@/lib/openai";

const chatAttachmentSchema = z.object({
  url: z.url(),
  name: z.string().min(1),
  type: z.string().min(1),
  size: z.number().optional(),
});

const chatSchema = z.object({
  conversationId: z.string().optional().nullable(),
  prompt: z.string().trim().min(1),
  attachments: z.array(chatAttachmentSchema).max(8).optional().nullable(),
});

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = chatSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid input" }, { status: 400 });
  }

  const { prompt } = parsed.data;
  const attachments = parsed.data.attachments ?? [];
  const userId = session.user.id;

  let conversationId = parsed.data.conversationId;

  let conversation;
  let title: string | null = null;

  if (!conversationId) {
    title = await chat.generateTitle(prompt);

    conversation = await prisma.conversation.create({
      data: {
        title,
        participants: {
          create: { userId },
        },
      },
    });

    conversationId = conversation.id;
  } else {
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        userId_conversationId: {
          userId,
          conversationId,
        },
      },
      select: {
        conversation: true,
      },
    });

    conversation = participant?.conversation;
    if (!conversation) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
  }

  // =======================
  // SAVE USER MESSAGE
  // =======================

  const userMessage = await prisma.message.create({
    data: {
      conversationId,
      senderId: userId,
      role: "USER",
      content: prompt,
      attachments: {
        create: attachments.map((f) => ({
          url: f.url,
          fileName: f.name,
          fileType: f.type,
          fileSize: f.size,
        })),
      },
    },
    include: { attachments: true },
  });

  // =======================
  // LOAD CONTEXT
  // =======================

  const messages = await prisma.message.findMany({
    where: {
      conversationId,
    },
    orderBy: { createdAt: "asc" },
    take: 20,
    include: { attachments: true },
  });

  // =======================
  // BUILD MODEL MESSAGES
  // =======================

  const currentContent = await chat.buildUserContent(prompt, attachments);

  const modelMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

  for (const msg of messages) {
    if (!msg.content) continue;

    if (msg.role === "ASSISTANT") {
      modelMessages.push({
        role: "assistant",
        content: msg.content,
      });
      continue;
    }

    if (msg.role === "SYSTEM") {
      modelMessages.push({
        role: "system",
        content: msg.content,
      });
      continue;
    }

    if (msg.id === userMessage.id) {
      modelMessages.push({
        role: "user",
        content: currentContent,
      });
    } else {
      const summary = chat.attachmentSummary(msg.attachments);

      modelMessages.push({
        role: "user",
        content: [msg.content, summary].filter(Boolean).join("\n\n"),
      });
    }
  }

  // =======================
  // CALL OPENAI
  // =======================

  const openai = getOpenAIClient();

  const stream = await openai.chat.completions.create({
    model: OPENAI_CHAT_MODEL,
    messages: [
      {
        role: "system",
        content: `
You are a helpful assistant.
- Use attached files if provided
- Analyze images if present
- Extract info from PDF/text
- Keep answer concise
        `.trim(),
      },
      ...modelMessages,
    ],
    stream: true,
  });

  // Create a readable stream for the response
  const encoder = new TextEncoder();
  let fullAnswer = "";

  const customReadable = new ReadableStream({
    async start(controller) {
      try {
        // Send conversation immediately
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              conversation: {
                id: conversation.id,
                title: conversation.title,
                createdAt: conversation.createdAt,
                updatedAt: conversation.updatedAt,
              },
            })}\n\n`,
          ),
        );

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content || "";
          if (delta) {
            fullAnswer += delta;
            // Send chunk to client
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk: delta })}\n\n`));
          }
        }

        // =======================
        // SAVE ASSISTANT MESSAGE
        // =======================

        const assistantMessage = await prisma.message.create({
          data: {
            conversationId,
            senderId: userId,
            role: "ASSISTANT",
            content: fullAnswer || "Sorry, I couldn't generate a response.",
          },
        });

        // Send completion signal
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              done: true,
              assistantMessage: {
                id: assistantMessage.id,
                content: assistantMessage.content,
                role: assistantMessage.role,
                createdAt: assistantMessage.createdAt,
              },
            })}\n\n`,
          ),
        );

        controller.close();
      } catch (error) {
        console.error("Stream error:", error);
        controller.error(error);
      }
    },
  });

  return new NextResponse(customReadable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
