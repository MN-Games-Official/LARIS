import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';
import { ApplicationSchema } from '@/lib/validation';

// GET /api/applications - List all applications for current user
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    const where = {
      user_id: auth.userId,
      ...(search && { name: { contains: search } }),
    };

    const [applications, total] = await db.$transaction([
      db.application.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          group_id: true,
          target_role: true,
          pass_score: true,
          is_active: true,
          primary_color: true,
          secondary_color: true,
          created_at: true,
          updated_at: true,
          _count: { select: { submissions: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updated_at: 'desc' },
      }),
      db.application.count({ where }),
    ]);

    // Get pass counts
    const passCountsRaw = await db.applicationSubmission.groupBy({
      by: ['application_id'],
      where: {
        application_id: { in: applications.map((a: { id: string; _count: { submissions: number } }) => a.id) },
        passed: true,
      },
      _count: { id: true },
    });

    const passCountMap: Record<string, number> = {};
    passCountsRaw.forEach((row: { application_id: string; _count: { id: number } }) => {
      passCountMap[row.application_id] = row._count.id;
    });

    const formatted = applications.map((app: { id: string; name: string; description: string | null; group_id: string; target_role: string; pass_score: number; is_active: boolean; primary_color: string; secondary_color: string; created_at: Date; updated_at: Date; _count: { submissions: number } }) => ({
      id: app.id,
      name: app.name,
      description: app.description,
      group_id: app.group_id,
      target_role: app.target_role,
      pass_score: app.pass_score,
      is_active: app.is_active,
      primary_color: app.primary_color,
      secondary_color: app.secondary_color,
      created_at: app.created_at,
      updated_at: app.updated_at,
      submission_count: app._count.submissions,
      pass_count: passCountMap[app.id] || 0,
    }));

    return NextResponse.json({
      success: true,
      applications: formatted,
      total,
      page,
      page_size: limit,
      total_pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('[GET /api/applications]', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// POST /api/applications - Create new application
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const parsed = ApplicationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, description, group_id, target_role, pass_score, style, questions } = parsed.data;

    // Enforce short-answer limit
    const shortAnswerCount = questions.filter((q) => q.type === 'short_answer').length;
    if (shortAnswerCount > 3) {
      return NextResponse.json(
        { success: false, error: 'Maximum 3 short-answer questions allowed' },
        { status: 400 }
      );
    }

    const app = await db.application.create({
      data: {
        user_id: auth.userId,
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

    return NextResponse.json({ success: true, application: { ...app, questions } }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/applications]', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
