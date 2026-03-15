import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateEmailToken } from '@/lib/auth';
import { ForgotPasswordSchema } from '@/lib/validation';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = ForgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid email' }, { status: 400 });
    }

    const { email } = parsed.data;

    // Always return success to prevent email enumeration
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, username: true },
    });

    if (user) {
      const token = generateEmailToken();
      const expires_at = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Invalidate old tokens
      await db.passwordReset.updateMany({
        where: { user_id: user.id, used: false },
        data: { used: true },
      });

      await db.passwordReset.create({
        data: { user_id: user.id, token, expires_at },
      });

      sendPasswordResetEmail(email, user.username, token).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      message: 'If that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('[POST /api/password/request-reset]', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
