'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import PlatformSelector from '@/components/PlatformSelector';
import MediaUploader from '@/components/MediaUploader';
import MetadataPanel from '@/components/MetadataPanel';
import { Post, PlatformId, ContentType, PostMetadata, MediaFile } from '@/lib/types';
import { savePost, getApiKeys } from '@/lib/storage';
import { PLATFORM_SVG_PATHS } from '@/lib/platforms';

const PLATFORM_COLORS: Record<string, string> = {
  facebook: '#1877F2', instagram: '#E1306C', youtube: '#FF0000',
  tiktok: '#69C9D0', linkedin: '#0A66C2', x: 'var(--color-x)',
};

const emptyMeta: PostMetadata = { hashtags: [], mentions: [] };

export default function ComposePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const email = session?.user?.email || undefined;
  const [platforms, setPlatforms] = useState<PlatformId[]>([]);
  const [contentType, setContentType] = useState<ContentType>('text');
  const [text, setText] = useState('');
  const [media, setMedia] = useState<MediaFile | null>(null);
  const [metadata, setMetadata] = useState<PostMetadata>(emptyMeta);
  const [isPosting, setIsPosting] = useState(false);
  const [results, setResults] = useState<{ platform: string; success: boolean; message: string }[] | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const canPost = platforms.length > 0 && (text.trim().length > 0 || media !== null);

  const handlePost = async () => {
    if (!canPost) return;
    setIsPosting(true);
    setResults(null);
    
    let apiKeys = getApiKeys(email);

    // Silently refresh TikTok token if expired or expiring (within a 5-minute buffer)
    if (platforms.includes('tiktok') && apiKeys.tiktok_refresh_token && apiKeys.tiktok_client_key && apiKeys.tiktok_client_secret) {
      const isExpired = !apiKeys.tiktok_expires_at || (apiKeys.tiktok_expires_at - Date.now() < 5 * 60 * 1000);
      if (isExpired) {
        try {
          const refreshRes = await fetch('/api/auth/tiktok/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              refresh_token: apiKeys.tiktok_refresh_token,
              client_key: apiKeys.tiktok_client_key,
              client_secret: apiKeys.tiktok_client_secret,
            }),
          });
          const refreshData = await refreshRes.json();
          if (refreshRes.ok && refreshData.success) {
            apiKeys = {
              ...apiKeys,
              tiktok: refreshData.access_token,
              tiktok_refresh_token: refreshData.refresh_token,
              tiktok_expires_at: Date.now() + refreshData.expires_in * 1000,
            };
            saveApiKeys(apiKeys, email);
          }
        } catch (e) {
          console.error('Failed to silently refresh TikTok token:', e);
        }
      }
    }

    const postResults: { platform: string; success: boolean; message: string }[] = [];

    for (const pid of platforms) {
      try {
        const res = await fetch('/api/post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: pid,
            contentType,
            text,
            metadata,
            apiKeys,
            mediaUrl: media?.url || null,
            mediaName: media?.name || null,
            mediaMime: media?.mimeType || null,
          }),
        });
        const data = await res.json();
        postResults.push({ platform: pid, success: data.success, message: data.message || (data.success ? 'Posted successfully!' : 'Failed to post') });
      } catch {
        postResults.push({ platform: pid, success: false, message: 'Network error — check your API keys in Settings' });
      }
    }

    // Save post to local storage
    const post: Post = {
      id: Math.random().toString(36).slice(2) + Date.now(),
      platforms,
      contentType,
      textContent: text,
      media: media || undefined,
      metadata,
      status: postResults.every(r => r.success) ? 'published' : postResults.some(r => r.success) ? 'published' : 'failed',
      createdAt: new Date().toISOString(),
      scheduledAt: metadata.scheduledAt,
      results: postResults.map(r => ({ platform: r.platform as PlatformId, success: r.success, error: r.success ? undefined : r.message })),
    };
    savePost(post, email);
    setResults(postResults);
    setIsPosting(false);
  };

  const handleSaveDraft = () => {
    const post: Post = {
      id: Math.random().toString(36).slice(2) + Date.now(),
      platforms, contentType, textContent: text, media: media || undefined, metadata,
      status: 'draft', createdAt: new Date().toISOString(),
    };
    savePost(post, email);
    router.push('/history');
  };

  const STEPS = [
    { n: 1, label: 'Content' },
    { n: 2, label: 'Platforms' },
    { n: 3, label: 'Metadata & Post' },
  ];

  return (
    <div style={{ padding: '32px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="gradient-text" style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Compose Post</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Create and publish content across all your social platforms at once.</p>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
        {STEPS.map((s, i) => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={() => setStep(s.n as 1|2|3)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', background: step === s.n ? 'rgba(124,58,237,0.2)' : 'transparent', fontFamily: 'Inter,sans-serif', transition: 'all 0.2s' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, background: step >= s.n ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : 'var(--bg-elevated)', color: step >= s.n ? 'white' : 'var(--text-muted)', border: step < s.n ? '1px solid var(--border)' : 'none' }}>
                {step > s.n ? '✓' : s.n}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: step === s.n ? '#a78bfa' : 'var(--text-muted)' }}>{s.label}</span>
            </button>
            {i < STEPS.length - 1 && <div style={{ width: 40, height: 1, background: 'var(--border)' }} />}
          </div>
        ))}
      </div>

      {/* Results banner */}
      {results && (
        <div className="glass fade-in" style={{ padding: 20, marginBottom: 24, borderRadius: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>
            {results.every(r => r.success) ? '🎉 All posts published!' : results.some(r => r.success) ? '⚠️ Partially published' : '❌ Posting failed'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {results.map(r => (
              <div key={r.platform} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: r.success ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${r.success ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill={PLATFORM_COLORS[r.platform] || '#888'}>
                  <path d={PLATFORM_SVG_PATHS[r.platform]} />
                </svg>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600, textTransform: 'capitalize', fontSize: 14 }}>{r.platform}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>{r.message}</span>
                </div>
                <span style={{ fontSize: 18 }}>{r.success ? '✅' : '❌'}</span>
              </div>
            ))}
          </div>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => { setResults(null); setPlatforms([]); setText(''); setMedia(null); setMetadata(emptyMeta); setStep(1); }}>
            ✏️ Compose Another Post
          </button>
        </div>
      )}

      {!results && (
        <div style={{ display: 'grid', gridTemplateColumns: step === 3 ? '1fr 420px' : '1fr', gap: 24 }}>
          {/* Main content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Step 1: Content */}
            {step === 1 && (
              <div className="glass fade-in" style={{ padding: 28 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Step 1 — Your Content</h2>
                <MediaUploader contentType={contentType} onContentTypeChange={setContentType} media={media} onMediaChange={setMedia} text={text} onTextChange={setText} />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                  <button className="btn-primary" onClick={() => setStep(2)} disabled={!text.trim() && !media}>
                    Next: Choose Platforms →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Platforms */}
            {step === 2 && (
              <div className="glass fade-in" style={{ padding: 28 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Step 2 — Select Platforms</h2>
                <PlatformSelector selected={platforms} onChange={setPlatforms} contentType={contentType} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                  <button className="btn-secondary" onClick={() => setStep(1)}>← Back</button>
                  <button className="btn-primary" onClick={() => setStep(3)} disabled={platforms.length === 0}>
                    Next: Metadata & Post →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Preview + Post */}
            {step === 3 && (
              <div className="glass fade-in" style={{ padding: 28 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Step 3 — Preview</h2>

                {/* Content preview */}
                <div style={{ padding: 18, borderRadius: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border)', marginBottom: 20 }}>
                  {media?.type === 'image' && <img src={media.url} alt="preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }} />}
                  {media?.type === 'video' && <video src={media.url} controls style={{ width: '100%', maxHeight: 200, borderRadius: 8, marginBottom: 12 }} />}
                  {text && <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{text}</p>}
                  {metadata.hashtags.length > 0 && (
                    <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {metadata.hashtags.map(h => <span key={h} className="tag-pill" style={{ fontSize: 11 }}>#{h}</span>)}
                    </div>
                  )}
                </div>

                {/* Platforms posting to */}
                <div style={{ marginBottom: 20 }}>
                  <div className="section-label">Posting to</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {platforms.map(pid => (
                      <div key={pid} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, background: `${PLATFORM_COLORS[pid]}18`, border: `1px solid ${PLATFORM_COLORS[pid]}40` }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={PLATFORM_COLORS[pid]}><path d={PLATFORM_SVG_PATHS[pid]} /></svg>
                        <span style={{ fontSize: 13, fontWeight: 600, color: PLATFORM_COLORS[pid], textTransform: 'capitalize' }}>{pid}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button className="btn-secondary" onClick={() => setStep(2)}>← Back</button>
                  <button className="btn-secondary" onClick={handleSaveDraft}>💾 Save Draft</button>
                  <button className="btn-primary" onClick={handlePost} disabled={!canPost || isPosting} style={{ flex: 1, justifyContent: 'center', opacity: isPosting ? 0.7 : 1 }}>
                    {isPosting ? (
                      <>
                        <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                        Publishing...
                      </>
                    ) : (
                      <>🚀 {metadata.scheduledAt ? 'Schedule Post' : 'Publish Now'}</>
                    )}
                  </button>
                </div>

                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}
          </div>

          {/* Right: Metadata panel (only on step 3) */}
          {step === 3 && (
            <div className="glass fade-in" style={{ padding: 24, height: 'fit-content', position: 'sticky', top: 24 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Metadata & SEO</h2>
              <MetadataPanel metadata={metadata} onChange={setMetadata} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
