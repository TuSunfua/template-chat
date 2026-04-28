import { Buffer } from "node:buffer";
import OpenAI from "openai";

import { getOpenAIClient, OPENAI_CHAT_MODEL } from "./openai";

const MAX_TEXT_ATTACHMENT_CHARS = 24000;
const MAX_PDF_BYTES = 6 * 1024 * 1024;

function isImage(type: string) {
  return type.startsWith("image/");
}

function isText(type: string) {
  return type.startsWith("text/");
}

function isPdf(type: string) {
  return type === "application/pdf";
}

async function fetchFile(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Fetch failed");
  return res;
}

function cleanTitle(raw: string) {
  return raw
    .replace(/[\r\n]+/g, " ")
    .replace(/^['"\s]+|['"\s]+$/g, "")
    .trim()
    .slice(0, 80);
}

export async function generateTitle(prompt: string) {
  const openai = getOpenAIClient();

  const content = `
Generate a concise, descriptive title for the user's input.

Strict rules:
- Describe the intent of the question, not the answer
- Do NOT compute or answer the question
- Use natural language (like a chat title)
- Max 8 words
- No quotes, no punctuation at the end

Examples:
Input: "1 + 1 = ?"
Output: Simple addition problem

Input: "Explain how HTTP server works in Python"
Output: Python HTTP server explanation

Input: "100 days from Tuesday is what day?"
Output: Calculating future day from Tuesday
`;

  try {
    const res = await openai.chat.completions.create({
      model: OPENAI_CHAT_MODEL,
      temperature: 0.2,
      max_completion_tokens: 60,
      messages: [
        {
          role: "system",
          content,
        },
        { role: "user", content: prompt },
      ],
    });

    return cleanTitle(res.choices[0]?.message?.content || prompt);
  } catch {
    return cleanTitle(prompt);
  }
}

export async function buildUserContent(
  prompt: string,
  attachments: Array<{ url: string; name: string; type: string }>,
): Promise<OpenAI.Chat.Completions.ChatCompletionContentPart[]> {
  const parts: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [];

  // text prompt
  parts.push({
    type: "text",
    text: prompt,
  });

  for (const file of attachments) {
    try {
      // IMAGE
      if (isImage(file.type)) {
        parts.push({
          type: "image_url",
          image_url: { url: file.url },
        });
        continue;
      }

      // TEXT FILE
      if (isText(file.type)) {
        const res = await fetchFile(file.url);
        const text = (await res.text()).slice(0, MAX_TEXT_ATTACHMENT_CHARS);

        parts.push({
          type: "text",
          text: `File (${file.name}):\n${text}`,
        });
        continue;
      }

      // PDF
      if (isPdf(file.type)) {
        const res = await fetchFile(file.url);
        const buffer = await res.arrayBuffer();

        if (buffer.byteLength > MAX_PDF_BYTES) {
          parts.push({
            type: "text",
            text: `PDF ${file.name} is too large to process (max ${MAX_PDF_BYTES} bytes)`,
          });
          continue;
        }

        const base64 = Buffer.from(buffer).toString("base64");

        parts.push({
          type: "file",
          file: {
            filename: file.name,
            file_data: `data:application/pdf;base64,${base64}`,
          },
        });
      }
    } catch {
      parts.push({
        type: "text",
        text: `Failed to fetch file ${file.name}`,
      });
    }
  }

  return parts;
}

export function attachmentSummary(attachments: Array<{ fileName: string; fileType: string; url: string }>) {
  if (!attachments.length) return "";

  return attachments.map((f) => `File: ${f.fileName} (${f.fileType})`).join("\n");
}
