import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';
import { ApplicationSchema } from '@/lib/validation';

type Params = { params: Promise<{ id: string }> };

// GET /api/applications/[id]
export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const app = await db.application.findFirst({
      where: { id: id, user_id: auth.userId },
    });

    if (!app) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      application: {
        ...app,
        questions: JSON.parse(app.questions_json),
        style: app.style_json ? JSON.parse(app.style_json) : {},
      },
    });
  } catch (error) {
    console.error('[GET /api/applications/[id]]', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// PUT /api/applications/[id]
export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const existing = await db.application.findFirst({
      where: { id: id, user_id: auth.userId },
      select: { id: true },
    });
    if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    const body = await request.json();
    const parsed = ApplicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, description, group_id, target_role, pass_score, style, questions } = parsed.data;

    const shortAnswerCount = questions.filter((q) => q.type === 'short_answer').length;
    if (shortAnswerCount > 3) {
      return NextResponse.json(
        { success: false, error: 'Maximum 3 short-answer questions allowed' },
        { status: 400 }
      );
    }

    const updated = await db.application.update({
      where: { id: id },
      data: {
        name,
        description: description || null,
        group_id,
        target_role,
        pass_score,
        primary_color: style?.primary_color || '#ff4b6e',
        secondary_color: style?.secondary_color || '#1f2933',
        questions_json: JSON.stringify(questions),
        style_json: JSON.stringify(style || {}),
      },
    });

    return NextResponse.json({
      success: true,
      application: { ...updated, questions, style },
    });
  } catch (error) {
    console.error('[PUT /api/applications/[id]]', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// DELETE /api/applications/[id]
export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const existing = await db.application.findFirst({
      where: { id: id, user_id: auth.userId },
      select: { id: true },
    });
    if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    await db.application.delete({ where: { id: id } });

    return NextResponse.json({ success: true, message: 'Application deleted' });
  } catch (error) {
    console.error('[DELETE /api/applications/[id]]', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
