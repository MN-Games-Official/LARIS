import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';
import { ChangePasswordSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const parsed = ChangePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { current_password, new_password } = parsed.data;

    const user = await db.user.findUnique({
      where: { id: auth.userId },
      select: { password_hash: true },
    });

    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const valid = await bcrypt.compare(current_password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 });
    }

    const new_hash = await bcrypt.hash(new_password, 12);
    await db.user.update({
      where: { id: auth.userId },
      data: { password_hash: new_hash },
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
