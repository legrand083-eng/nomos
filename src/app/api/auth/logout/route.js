import { NextResponse } from 'next/server';
import { logout, verifyAccessToken } from '@/lib/auth';
import cookie from 'cookie';

export async function POST(request) {
  try {
    // Get token from header or cookie
    const authHeader = request.headers.get('authorization');
    const cookies = cookie.parse(request.headers.get('cookie') || '');
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : cookies.nomos_token;

    if (!token) {
      return NextResponse.json(
        { error: 'NO_TOKEN', message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'INVALID_TOKEN', message: 'Token invalide' },
        { status: 401 }
      );
    }

    await logout(payload.userId);

    const response = NextResponse.json({ success: true });

    // Clear cookie
    response.headers.set(
      'Set-Cookie',
      cookie.serialize('nomos_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/'
      })
    );

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
