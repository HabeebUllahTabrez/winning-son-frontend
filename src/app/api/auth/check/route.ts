import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    // Return 200 with authenticated: false (not an error, just not logged in)
    return NextResponse.json(
      { authenticated: false },
      { status: 200 }
    );
  }

  // Verify token with backend
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';
    const response = await fetch(`${backendUrl}/api/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Token is invalid, return 200 with authenticated: false
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { authenticated: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Auth check error:', error);
    // On error, assume not authenticated
    return NextResponse.json(
      { authenticated: false },
      { status: 200 }
    );
  }
}
