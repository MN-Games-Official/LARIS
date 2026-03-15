import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';
import { AIGenerationSchema } from '@/lib/validation';
import { generateApplicationForm } from '@/lib/ai-service';

type Params = { params: Promise<{ id: string }> };

// POST /api/applications/[id]/generate - AI form generation
export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    // Verify application belongs to user
    if (id !== 'new') {
      const existing = await db.application.findFirst({
        where: { id: id, user_id: auth.userId },
        select: { id: true },
      });
      if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = AIGenerationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const form = await generateApplicationForm(parsed.data);

    return NextResponse.json({ success: true, form });
  } catch (error: any) {
    console.error('[POST /api/applications/[id]/generate]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'AI generation failed' },
      { status: 500 }
    );
  }
}
