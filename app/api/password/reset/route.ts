import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { ResetPasswordSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = ResetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { token, new_password } = parsed.data;

    const reset = await db.passwordReset.findUnique({
      where: { token },
      include: { user: { select: { id: true, email: true } } },
    });

    if (!reset || reset.used) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    if (reset.expires_at < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Reset token has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    const password_hash = await bcrypt.hash(new_password, 12);

    await db.$transaction([
      db.user.update({
        where: { id: reset.user_id },
        data: { password_hash },
      }),
      db.passwordReset.update({
        where: { id: reset.id },
        data: { used: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now log in.',
    });
  } catch (error) {
    console.error('[POST /api/password/reset]', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
