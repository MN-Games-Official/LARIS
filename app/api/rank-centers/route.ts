import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';
import { RankCenterSchema } from '@/lib/validation';

// GET /api/rank-centers
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const centers = await db.rankCenter.findMany({
      where: { user_id: auth.userId },
      select: {
        id: true,
        name: true,
        group_id: true,
        universe_id: true,
        created_at: true,
        updated_at: true,
        ranks_json: true,
      },
      orderBy: { updated_at: 'desc' },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatted = (centers as any[]).map((c) => {
      const ranks = JSON.parse(c.ranks_json || '[]');
      return {
        id: c.id,
        name: c.name,
        group_id: c.group_id,
        universe_id: c.universe_id,
        created_at: c.created_at,
        updated_at: c.updated_at,
        rank_count: Array.isArray(ranks) ? ranks.length : 0,
      };
    });

    return NextResponse.json({ success: true, rank_centers: formatted });
  } catch (error) {
    console.error('[GET /api/rank-centers]', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// POST /api/rank-centers
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const parsed = RankCenterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, group_id, universe_id, ranks } = parsed.data;

    const center = await db.rankCenter.create({
      data: {
        user_id: auth.userId,
        name,
        group_id,
        universe_id: universe_id || null,
        ranks_json: JSON.stringify(ranks),
      },
    });

    return NextResponse.json(
      { success: true, rank_center: { ...center, ranks } },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/rank-centers]', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
