import { NextRequest, NextResponse } from 'next/server';

interface PostPayload {
  platform: string;
  contentType: 'text' | 'image' | 'video';
  text: string;
  metadata: {
    title?: string;
    description?: string;
    hashtags: string[];
    mentions: string[];
    location?: string;
    altText?: string;
    category?: string;
    language?: string;
    isSponsored?: boolean;
    scheduledAt?: string;
  };
  apiKeys: Record<string, string>;
  mediaUrl?: string;
  mediaName?: string;
  mediaMime?: string;
}

// Build full post text with hashtags + mentions
function buildCaption(text: string, hashtags: string[], mentions: string[]): string {
  let caption = text || '';
  if (mentions.length > 0) caption += '\n' + mentions.map(m => `@${m}`).join(' ');
  if (hashtags.length > 0) caption += '\n' + hashtags.map(h => `#${h}`).join(' ');
  return caption.trim();
}

// ── FACEBOOK ──────────────────────────────────────────────────────────────────
async function postToFacebook(payload: PostPayload) {
  const { apiKeys, text, metadata, contentType, mediaUrl } = payload;
  const token = apiKeys.facebook;
  const pageId = apiKeys.facebook_page_id;
  if (!token || !pageId) return { success: false, message: 'Missing Facebook Access Token or Page ID' };

  const caption = buildCaption(text, metadata.hashtags, metadata.mentions);

  try {
    if (contentType === 'text') {
      const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: caption, access_token: token }),
      });
      const data = await res.json();
      if (data.id) return { success: true, message: `Posted! ID: ${data.id}` };
      return { success: false, message: data.error?.message || 'Facebook post failed' };
    }
    if (contentType === 'image' && mediaUrl) {
      const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption, url: mediaUrl, access_token: token }),
      });
      const data = await res.json();
      if (data.id) return { success: true, message: `Photo posted! ID: ${data.id}` };
      return { success: false, message: data.error?.message || 'Facebook photo post failed' };
    }
    if (contentType === 'video' && mediaUrl) {
      const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: caption, title: metadata.title || 'Video', file_url: mediaUrl, access_token: token }),
      });
      const data = await res.json();
      if (data.id) return { success: true, message: `Video posted! ID: ${data.id}` };
      return { success: false, message: data.error?.message || 'Facebook video post failed' };
    }
    return { success: false, message: 'No valid content to post' };
  } catch (e) {
    return { success: false, message: `Facebook error: ${String(e)}` };
  }
}

// ── INSTAGRAM ─────────────────────────────────────────────────────────────────
async function postToInstagram(payload: PostPayload) {
  const { apiKeys, text, metadata, contentType, mediaUrl } = payload;
  const token = apiKeys.instagram;
  const userId = apiKeys.instagram_user_id;
  if (!token || !userId) return { success: false, message: 'Missing Instagram Access Token or User ID' };
  if (!mediaUrl) return { success: false, message: 'Instagram requires an image or video' };

  const caption = buildCaption(text, metadata.hashtags, metadata.mentions);
  try {
    // Step 1: Create media container
    const containerBody: Record<string, string> = { caption, access_token: token };
    if (contentType === 'image') { containerBody.image_url = mediaUrl; containerBody.media_type = 'IMAGE'; }
    else if (contentType === 'video') { containerBody.video_url = mediaUrl; containerBody.media_type = 'REELS'; }

    const containerRes = await fetch(`https://graph.facebook.com/v19.0/${userId}/media`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(containerBody),
    });
    const container = await containerRes.json();
    if (!container.id) return { success: false, message: container.error?.message || 'Failed to create Instagram container' };

    // Step 2: Publish container
    const publishRes = await fetch(`https://graph.facebook.com/v19.0/${userId}/media_publish`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creation_id: container.id, access_token: token }),
    });
    const published = await publishRes.json();
    if (published.id) return { success: true, message: `Posted to Instagram! ID: ${published.id}` };
    return { success: false, message: published.error?.message || 'Instagram publish failed' };
  } catch (e) {
    return { success: false, message: `Instagram error: ${String(e)}` };
  }
}

// ── YOUTUBE ───────────────────────────────────────────────────────────────────
async function postToYouTube(payload: PostPayload) {
  const { apiKeys, text, metadata, mediaUrl } = payload;
  const token = apiKeys.youtube;
  if (!token) return { success: false, message: 'Missing YouTube Access Token' };
  if (!mediaUrl) return { success: false, message: 'YouTube requires a video file' };

  const tags = [...metadata.hashtags, ...(metadata.mentions || [])];
  try {
    const res = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'X-Upload-Content-Type': payload.mediaMime || 'video/mp4' },
      body: JSON.stringify({
        snippet: {
          title: metadata.title || text.slice(0, 100) || 'New Video',
          description: buildCaption(text, metadata.hashtags, metadata.mentions),
          tags,
          categoryId: '22', // People & Blogs default
        },
        status: { privacyStatus: 'public' },
      }),
    });
    if (res.ok) {
      const location = res.headers.get('Location');
      return { success: true, message: `YouTube upload initiated. Resume URI obtained. Video ID will be available after upload.` };
    }
    const err = await res.json();
    return { success: false, message: err.error?.message || 'YouTube upload failed' };
  } catch (e) {
    return { success: false, message: `YouTube error: ${String(e)}` };
  }
}

// ── TIKTOK ────────────────────────────────────────────────────────────────────
async function postToTikTok(payload: PostPayload) {
  const { apiKeys, text, metadata, mediaUrl, mediaMime, contentType } = payload;
  const token = apiKeys.tiktok;
  if (!token) return { success: false, message: 'Missing TikTok Access Token' };
  if (!mediaUrl) return { success: false, message: 'TikTok requires media' };

  const caption = buildCaption(text, metadata.hashtags, metadata.mentions).slice(0, 2200);

  try {
    // VIDEO UPLOAD (Uses FILE_UPLOAD - no domain verification required)
    if (contentType === 'video') {
      // 1. Fetch media to get buffer and file size
      let mediaBuffer: ArrayBuffer;
      if (mediaUrl.startsWith('data:')) {
        const base64Data = mediaUrl.split(',')[1];
        const nodeBuf = Buffer.from(base64Data, 'base64');
        // Safely extract a proper ArrayBuffer (Buffer may share memory)
        mediaBuffer = nodeBuf.buffer.slice(nodeBuf.byteOffset, nodeBuf.byteOffset + nodeBuf.byteLength) as ArrayBuffer;
      } else {
        const fetchRes = await fetch(mediaUrl);
        if (!fetchRes.ok) throw new Error('Failed to download media for TikTok');
        mediaBuffer = await fetchRes.arrayBuffer();
      }
      const fileSize = mediaBuffer.byteLength;

      // 2. Initialize upload
      const initRes = await fetch('https://open.tiktokapis.com/v2/post/publish/inbox/video/init/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({
          source_info: { 
            source: 'FILE_UPLOAD', 
            video_size: fileSize, 
            chunk_size: fileSize, 
            total_chunk_count: 1 
          },
        }),
      });
      const initData = await initRes.json();
      if (initData.error?.code !== 'ok') {
        return { success: false, message: initData.error?.message || 'TikTok init failed' };
      }
      
      const { upload_url, publish_id } = initData.data;

      // 3. Put the actual file
      const uploadRes = await fetch(upload_url, {
        method: 'PUT',
        headers: {
          'Content-Range': `bytes 0-${fileSize - 1}/${fileSize}`,
          'Content-Type': mediaMime || 'video/mp4',
        },
        body: mediaBuffer,
      });

      if (!uploadRes.ok) return { success: false, message: 'TikTok file upload failed' };
      return { success: true, message: `TikTok video sent to Inbox! Publish ID: ${publish_id}` };
    } 
    
    // IMAGE/PHOTO UPLOAD (Requires PULL_FROM_URL - domain must be verified in TikTok Portal)
    else if (contentType === 'image') {
      if (mediaUrl.startsWith('data:')) {
        return { success: false, message: 'TikTok photo upload requires a public URL, not a base64 data stream. Please host the image first.' };
      }

      const initRes = await fetch('https://open.tiktokapis.com/v2/post/publish/content/init/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({
          post_info: { 
            title: caption,
            description: caption 
          },
          source_info: { 
            source: 'PULL_FROM_URL', 
            photo_cover_index: 1, 
            photo_images: [mediaUrl] 
          },
          post_mode: 'MEDIA_UPLOAD',
          media_type: 'PHOTO'
        }),
      });

      const initData = await initRes.json();
      if (initData.error?.code !== 'ok') {
        return { success: false, message: initData.error?.message || 'TikTok photo init failed' };
      }

      return { success: true, message: `TikTok photo upload initiated! Publish ID: ${initData.data.publish_id}` };
    }

    return { success: false, message: 'TikTok only supports video and image uploads.' };

  } catch (e) {
    return { success: false, message: `TikTok error: ${String(e)}` };
  }
}

// ── LINKEDIN ──────────────────────────────────────────────────────────────────
async function postToLinkedIn(payload: PostPayload) {
  const { apiKeys, text, metadata, contentType, mediaUrl } = payload;
  const token = apiKeys.linkedin;
  const urn = apiKeys.linkedin_urn;
  if (!token || !urn) return { success: false, message: 'Missing LinkedIn Access Token or Person URN' };

  const commentary = buildCaption(text, metadata.hashtags, metadata.mentions).slice(0, 3000);
  try {
    const body: Record<string, unknown> = {
      author: urn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: commentary },
          shareMediaCategory: contentType === 'text' ? 'NONE' : contentType === 'image' ? 'IMAGE' : 'VIDEO',
        },
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    };

    const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'X-Restli-Protocol-Version': '2.0.0' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok && data.id) return { success: true, message: `LinkedIn post created! ID: ${data.id}` };
    return { success: false, message: data.message || 'LinkedIn post failed' };
  } catch (e) {
    return { success: false, message: `LinkedIn error: ${String(e)}` };
  }
}

// ── X (TWITTER) ───────────────────────────────────────────────────────────────
async function postToX(payload: PostPayload) {
  const { apiKeys, text, metadata } = payload;
  const apiKey = apiKeys.x;
  const apiSecret = apiKeys.x_secret;
  const accessToken = apiKeys.x_access_token;
  const accessSecret = apiKeys.x_access_secret;
  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    return { success: false, message: 'Missing X API Key, Secret, Access Token, or Access Secret' };
  }

  const tweetText = buildCaption(text, metadata.hashtags, metadata.mentions).slice(0, 280);
  try {
    // OAuth 1.0a signature generation
    const method = 'POST';
    const url = 'https://api.twitter.com/2/tweets';
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);

    const oauthParams: Record<string, string> = {
      oauth_consumer_key: apiKey,
      oauth_nonce: nonce,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: timestamp,
      oauth_token: accessToken,
      oauth_version: '1.0',
    };

    // Build parameter string
    const paramString = Object.keys(oauthParams).sort().map(k =>
      `${encodeURIComponent(k)}=${encodeURIComponent(oauthParams[k])}`
    ).join('&');

    const signatureBase = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;
    const signingKey = `${encodeURIComponent(apiSecret)}&${encodeURIComponent(accessSecret)}`;

    // HMAC-SHA1 via Web Crypto
    const encoder = new TextEncoder();
    const keyData = encoder.encode(signingKey);
    const msgData = encoder.encode(signatureBase);
    const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
    const signature = btoa(String.fromCharCode(...new Uint8Array(sig)));

    oauthParams.oauth_signature = signature;

    const authHeader = 'OAuth ' + Object.keys(oauthParams).sort().map(k =>
      `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`
    ).join(', ');

    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: tweetText }),
    });
    const data = await res.json();
    if (data.data?.id) return { success: true, message: `Tweet posted! ID: ${data.data.id}` };
    return { success: false, message: data.detail || data.title || 'X post failed' };
  } catch (e) {
    return { success: false, message: `X error: ${String(e)}` };
  }
}

// ── MAIN HANDLER ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const payload: PostPayload = await req.json();
    const { platform } = payload;

    let result: { success: boolean; message: string };

    switch (platform) {
      case 'facebook':  result = await postToFacebook(payload); break;
      case 'instagram': result = await postToInstagram(payload); break;
      case 'youtube':   result = await postToYouTube(payload); break;
      case 'tiktok':    result = await postToTikTok(payload); break;
      case 'linkedin':  result = await postToLinkedIn(payload); break;
      case 'x':         result = await postToX(payload); break;
      default:          result = { success: false, message: `Unknown platform: ${platform}` };
    }

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ success: false, message: `Server error: ${String(e)}` }, { status: 500 });
  }
}
