import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';
import { encryptApiKey, createKeyPrefix } from '@/lib/encryption';
import { RobloxApiKeySchema } from '@/lib/validation';
import { RobloxService } from '@/lib/roblox-service';

// GET /api/api-keys/roblox
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const key = await db.apiKey.findFirst({
      where: { user_id: auth.userId, type: 'roblox', is_active: true },
      select: { id: true, key_prefix: true, last_used: true, created_at: true, is_active: true },
    });

    return NextResponse.json({ success: true, key: key || null });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// POST /api/api-keys/roblox - Save Roblox API key
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const parsed = RobloxApiKeySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { api_key, validate } = parsed.data;

    // Optionally validate key
    if (validate) {
      const svc = new RobloxService(api_key);
      const result = await svc.validateApiKey();
      if (!result.valid) {
        return NextResponse.json({ success: false, error: result.error || 'Invalid API key' }, { status: 400 });
      }
    }

    const encrypted = encryptApiKey(api_key);
    const prefix = createKeyPrefix(api_key, 'roblox');

    // Deactivate old keys
    await db.apiKey.updateMany({
      where: { user_id: auth.userId, type: 'roblox' },
      data: { is_active: false },
    });

    const newKey = await db.apiKey.create({
      data: {
        user_id: auth.userId,
        type: 'roblox',
        encrypted_key: encrypted,
        key_prefix: prefix,
        is_active: true,
      },
      select: { id: true, key_prefix: true, created_at: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Roblox API key saved and validated.',
      key: newKey,
    });
  } catch (error: any) {
    console.error('[POST /api/api-keys/roblox]', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

// DELETE /api/api-keys/roblox
export async function DELETE(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    await db.apiKey.updateMany({
      where: { user_id: auth.userId, type: 'roblox' },
      data: { is_active: false },
    });

    return NextResponse.json({ success: true, message: 'Roblox API key removed' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
