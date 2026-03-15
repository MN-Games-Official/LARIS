import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { generateAccessToken, generateRefreshToken, createAuthCookies } from '@/lib/auth';
import { LoginSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // Find user
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        full_name: true,
        password_hash: true,
        email_verified: true,
        avatar_url: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check email verification
    if (!user.email_verified) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please verify your email address before logging in.',
          code: 'EMAIL_NOT_VERIFIED',
        },
        { status: 403 }
      );
    }

    const payload = { userId: user.id, email: user.email, username: user.username };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    const cookies = createAuthCookies(accessToken, refreshToken);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
      },
      access_token: accessToken,
    });

    // Set cookies
    response.cookies.set('accessToken', cookies.accessToken.value, cookies.accessToken);
    response.cookies.set('refreshToken', cookies.refreshToken.value, cookies.refreshToken);

    return response;
  } catch (error: any) {
    console.error('[POST /api/auth/login]', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
