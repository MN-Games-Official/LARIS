import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';
import { RankCenterSchema } from '@/lib/validation';

type Params = { params: Promise<{ id: string }> };

// GET /api/rank-centers/[id]
export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const center = await db.rankCenter.findFirst({
      where: { id: id, user_id: auth.userId },
    });

    if (!center) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      rank_center: { ...center, ranks: JSON.parse(center.ranks_json) },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// PUT /api/rank-centers/[id]
export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const existing = await db.rankCenter.findFirst({
      where: { id: id, user_id: auth.userId },
      select: { id: true },
    });
    if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    const body = await request.json();
    const parsed = RankCenterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name, group_id, universe_id, ranks } = parsed.data;

    const updated = await db.rankCenter.update({
      where: { id: id },
      data: { name, group_id, universe_id: universe_id || null, ranks_json: JSON.stringify(ranks) },
    });

    return NextResponse.json({ success: true, rank_center: { ...updated, ranks } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// DELETE /api/rank-centers/[id]
export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const existing = await db.rankCenter.findFirst({
      where: { id: id, user_id: auth.userId },
      select: { id: true },
    });
    if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    await db.rankCenter.delete({ where: { id: id } });
    return NextResponse.json({ success: true, message: 'Rank center deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
