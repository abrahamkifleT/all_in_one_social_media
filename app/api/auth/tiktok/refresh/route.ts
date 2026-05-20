import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { refresh_token, client_key, client_secret } = await req.json();

    if (!refresh_token || !client_key || !client_secret) {
      return NextResponse.json(
        { success: false, message: 'Missing parameters' },
        { status: 400 }
      );
    }

    // Call TikTok's oauth token refresh API
    const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key,
        client_secret,
        grant_type: 'refresh_token',
        refresh_token,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      return NextResponse.json({
        success: false,
        message: data.error_description || data.error || 'TikTok token refresh failed',
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
      { success: false, message: `Server error during TikTok token refresh: ${String(error)}` },
      { status: 500 }
    );
  }
}
