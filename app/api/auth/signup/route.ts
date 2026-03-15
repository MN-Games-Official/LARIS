import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { generateAccessToken, generateRefreshToken, generateEmailToken, createAuthCookies } from '@/lib/auth';
import { SignupSchema } from '@/lib/validation';
import { sendVerificationEmail, sendWelcomeEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const parsed = SignupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, username, password, full_name } = parsed.data;

    // Check uniqueness
    const existing = await db.user.findFirst({
      where: { OR: [{ email }, { username }] },
      select: { email: true, username: true },
    });

    if (existing) {
      const field = existing.email === email ? 'email' : 'username';
      return NextResponse.json(
        { success: false, error: `This ${field} is already taken` },
        { status: 409 }
      );
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Create user
    const user = await db.user.create({
      data: {
        email,
        username,
        password_hash,
        full_name: full_name || null,
        email_verified: false,
      },
      select: { id: true, email: true, username: true },
    });

    // Generate email verification token (6h)
    const token = generateEmailToken();
    const expires_at = new Date(Date.now() + 6 * 60 * 60 * 1000);

    await db.emailVerification.create({
      data: {
        user_id: user.id,
        token,
        expires_at,
      },
    });

    // Send verification email (non-blocking)
    sendVerificationEmail(email, username, token).catch(console.error);

    return NextResponse.json(
      {
        success: true,
        message: 'Account created. Please check your email to verify your account.',
        user: { id: user.id, email: user.email, username: user.username },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[POST /api/auth/signup]', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
