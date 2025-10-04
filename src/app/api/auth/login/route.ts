import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Forward request to backend
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';
    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        data || { message: 'Login failed' },
        { status: response.status }
      );
    }

    // Extract token from backend response
    const { token } = data;

    // Create response
    const nextResponse = NextResponse.json(
      { success: true, message: 'Login successful' },
      { status: 200 }
    );

    // Set httpOnly cookie with security flags
    nextResponse.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return nextResponse;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
