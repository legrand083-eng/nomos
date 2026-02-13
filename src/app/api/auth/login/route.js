import { NextResponse } from 'next/server';
import { login } from '@/lib/auth';
import cookie from 'cookie';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, antiRobot } = body;

    if (!email || !password || !antiRobot) {
      return NextResponse.json(
        { error: 'MISSING_FIELDS', message: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Get client info
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Attempt login
    const result = await login(email, password, antiRobot, ipAddress, userAgent);

    if (!result.success) {
      const statusCode = result.error === 'ACCOUNT_LOCKED' ? 423 : 401;
      const messages = {
        'INVALID_CREDENTIALS': 'Email ou mot de passe incorrect',
        'ANTI_ROBOT_FAILED': 'Code anti-robot incorrect',
        'ACCOUNT_LOCKED': 'Compte verrouillé suite à plusieurs tentatives échouées'
      };
      
      return NextResponse.json(
        { 
          error: result.error, 
          message: messages[result.error] || 'Erreur de connexion',
          attemptsLeft: result.attemptsLeft,
          lockedUntil: result.lockedUntil
        },
        { status: statusCode }
      );
    }

    // Set cookie for refresh token
    const response = NextResponse.json({
      success: true,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user
    });

    response.headers.set(
      'Set-Cookie',
      cookie.serialize('nomos_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60, // 15 minutes
        path: '/'
      })
    );

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
