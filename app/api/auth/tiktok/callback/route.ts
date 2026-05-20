import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { code, client_key, client_secret, redirect_uri } = await req.json();

    if (!code || !client_key || !client_secret || !redirect_uri) {
      return NextResponse.json(
        { success: false, message: 'Missing parameters' },
        { status: 400 }
      );
    }

    // Call TikTok's oauth token exchange API
    const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key,
        client_secret,
        code,
        grant_type: 'authorization_code',
        redirect_uri,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      return NextResponse.json({
        success: false,
        message: data.error_description || data.error || 'TikTok token exchange failed',
        details: data
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      refresh_expires_in: data.refresh_expires_in
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: `Server error during TikTok OAuth exchange: ${String(error)}` },
      { status: 500 }
    );
  }
}
