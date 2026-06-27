// app/api/register/route.ts
// Creates a new Credentials-based user account.
// Validates with Zod, hashes password with bcrypt, checks for duplicate email.
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const RegisterSchema = z.object({
  name:     z.string().min(1, "Name is required").max(80),
  email:    z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid input";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { name, email, password } = parsed.data;

    // Check for existing user
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // Distinguish Google-only account from credentials account
      const hasPassword = Boolean(existing.password);
      const message = hasPassword
        ? "This email is already registered. Please sign in instead."
        : "This email is already registered via Google — please sign in with Google instead.";
      return NextResponse.json({ error: message }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: { name, email, password: hash },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
