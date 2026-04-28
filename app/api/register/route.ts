import { z } from "zod";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsedBody = registerSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        message: parsedBody.error.issues[0]?.message ?? "Invalid request body",
      },
      { status: 400 },
    );
  }

  const { name, username, password } = parsedBody.data;

  const existingUser = await prisma.user.findFirst({
    where: {
      username,
    },
    select: {
      id: true,
      username: true,
    },
  });

  if (existingUser) {
    return NextResponse.json({ message: "Username is already in use" }, { status: 409 });
  }

  const hashedPassword = await hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      username,
      password: hashedPassword,
    },
  });

  return NextResponse.json({ message: "Registered successfully" }, { status: 201 });
}
