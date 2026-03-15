import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'fallback-key-do-not-use-in-prod-x';

function getKey(): Buffer {
  return crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
}

// ─── Encrypt API Key ──────────────────────────────────────────────────────────

export function encryptApiKey(plaintext: string): string {
  const iv = crypto.randomBytes(16);
  const key = getKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

// ─── Decrypt API Key ──────────────────────────────────────────────────────────

export function decryptApiKey(encrypted: string): string {
  const [ivHex, encryptedData] = encrypted.split(':');
  if (!ivHex || !encryptedData) throw new Error('Invalid encrypted key format');
  const iv = Buffer.from(ivHex, 'hex');
  const key = getKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// ─── Key Prefix Generation ────────────────────────────────────────────────────

export function createKeyPrefix(key: string, type: 'roblox' | 'polaris'): string {
  const prefix = type === 'polaris' ? 'polaris_' : 'rblx_';
  return `${prefix}${key.slice(0, 8)}...${key.slice(-4)}`;
}

// ─── Random Key Generation ────────────────────────────────────────────────────

export function generateRandomKey(prefix: 'polaris'): string {
  const random = crypto.randomBytes(24).toString('base64url');
  return `polaris_${random}`;
}

// ─── Hash for Verification ────────────────────────────────────────────────────

export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}
