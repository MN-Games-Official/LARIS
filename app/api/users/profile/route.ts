import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';
import { UpdateProfileSchema } from '@/lib/validation';

// GET /api/users/profile
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const user = await db.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        email: true,
        username: true,
        full_name: true,
        avatar_url: true,
        email_verified: true,
        email_verified_at: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// PUT /api/users/profile
export async function PUT(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const parsed = UpdateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { full_name, avatar_url, username } = parsed.data;

    // Check username uniqueness if changing
    if (username) {
      const existing = await db.user.findFirst({
        where: { username, NOT: { id: auth.userId } },
        select: { id: true },
      });
      if (existing) {
        return NextResponse.json({ success: false, error: 'Username already taken' }, { status: 409 });
      }
    }

    const updated = await db.user.update({
      where: { id: auth.userId },
      data: {
        full_name: full_name !== undefined ? full_name || null : undefined,
        avatar_url: avatar_url !== undefined ? avatar_url || null : undefined,
        username: username || undefined,
      },
      select: {
        id: true,
        email: true,
        username: true,
        full_name: true,
        avatar_url: true,
        email_verified: true,
        created_at: true,
        updated_at: true,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error('[PUT /api/users/profile]', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
