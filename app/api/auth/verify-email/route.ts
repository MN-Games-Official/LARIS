import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
    }

    const verification = await db.emailVerification.findUnique({
      where: { token },
      include: { user: { select: { id: true, username: true } } },
    });

    if (!verification || verification.used) {
      return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
    }

    if (verification.expires_at < new Date()) {
      return NextResponse.redirect(new URL('/login?error=token_expired', request.url));
    }

    // Mark verified
    await db.$transaction([
      db.user.update({
        where: { id: verification.user_id },
        data: { email_verified: true, email_verified_at: new Date() },
      }),
      db.emailVerification.update({
        where: { id: verification.id },
        data: { used: true },
      }),
    ]);

    return NextResponse.redirect(new URL('/login?verified=1', request.url));
  } catch (error) {
    console.error('[GET /api/auth/verify-email]', error);
    return NextResponse.redirect(new URL('/login?error=server_error', request.url));
  }
}
