import { NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/auth';

export async function POST() {
  const cookies = clearAuthCookies();
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

  response.cookies.set('accessToken', '', {
    expires: new Date(0),
    path: '/',
    httpOnly: true,
  });
  response.cookies.set('refreshToken', '', {
    expires: new Date(0),
    path: '/',
    httpOnly: true,
  });

  return response;
}
