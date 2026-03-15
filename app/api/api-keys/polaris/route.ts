import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';
import { encryptApiKey, generateRandomKey, createKeyPrefix } from '@/lib/encryption';
import { PolarisApiKeySchema } from '@/lib/validation';

// GET /api/api-keys/polaris - List user's Polaris API keys
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const keys = await db.apiKey.findMany({
      where: { user_id: auth.userId, type: 'polaris', is_active: true },
      select: {
        id: true,
        name: true,
        key_prefix: true,
        scopes: true,
        last_used: true,
        expires_at: true,
        created_at: true,
        is_active: true,
      },
      orderBy: { created_at: 'desc' },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatted = (keys as any[]).map((k) => ({
      ...k,
      scopes: k.scopes ? JSON.parse(k.scopes) : [],
    }));

    return NextResponse.json({ success: true, keys: formatted });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// POST /api/api-keys/polaris - Generate new Polaris API key
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const parsed = PolarisApiKeySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name, scopes, expires_in } = parsed.data;

    // Generate key (plaintext — only returned once)
    const plainKey = generateRandomKey('polaris');
    const encrypted = encryptApiKey(plainKey);
    const prefix = createKeyPrefix(plainKey, 'polaris');
    const expires_at = expires_in ? new Date(Date.now() + expires_in * 1000) : null;

    const keyRecord = await db.apiKey.create({
      data: {
        user_id: auth.userId,
        type: 'polaris',
        name,
        encrypted_key: encrypted,
        key_prefix: prefix,
        scopes: JSON.stringify(scopes),
        expires_at: expires_at || undefined,
        is_active: true,
      },
      select: { id: true, name: true, key_prefix: true, created_at: true },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Copy this key now — it will not be shown again.',
        api_key: plainKey,
        key: { ...keyRecord, scopes },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/api-keys/polaris]', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
