import { NextResponse } from 'next/server';
import { refresh } from '@/lib/auth';
import cookie from 'cookie';

export async function POST(request) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'MISSING_TOKEN', message: 'Refresh token requis' },
        { status: 400 }
      );
    }

    const result = await refresh(refreshToken);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, message: 'Session expirée' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      accessToken: result.accessToken
    });

    response.headers.set(
      'Set-Cookie',
      cookie.serialize('nomos_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60,
        path: '/'
      })
    );

    return response;
  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
