'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ApiKeys } from '@/lib/types';
import { getApiKeys, saveApiKeys } from '@/lib/storage';
import { PLATFORM_SVG_PATHS } from '@/lib/platforms';

const PLATFORM_COLORS: Record<string, string> = {
  facebook:'#1877F2',instagram:'#E1306C',youtube:'#FF0000',
  tiktok:'#69C9D0',linkedin:'#0A66C2',x:'var(--color-x)',
};

interface PlatformConfig {
  id: string;
  name: string;
  color: string;
  docsUrl: string;
  fields: { key: keyof ApiKeys; label: string; placeholder: string; hint: string }[];
}

const PLATFORM_CONFIGS: PlatformConfig[] = [
  {
    id:'facebook', name:'Facebook', color:'#1877F2',
    docsUrl:'https://developers.facebook.com/docs/graph-api',
    fields:[
      { key:'facebook', label:'Page Access Token', placeholder:'EAAxxxxxxxx...', hint:'Generate from Facebook Developer Console → Graph API Explorer' },
      { key:'facebook_page_id', label:'Page ID', placeholder:'123456789012345', hint:'Found in your Facebook Page settings → About' },
    ],
  },
  {
    id:'instagram', name:'Instagram', color:'#E1306C',
    docsUrl:'https://developers.facebook.com/docs/instagram-api',
    fields:[
      { key:'instagram', label:'Access Token', placeholder:'EAAxxxxxxxx...', hint:'Use Facebook Graph API — Instagram Graph API shares the same token' },
      { key:'instagram_user_id', label:'Instagram Business Account ID', placeholder:'17841xxxxxxxxx', hint:'Found via GET /me/accounts in Graph API Explorer' },
    ],
  },
  {
    id:'youtube', name:'YouTube', color:'#FF0000',
    docsUrl:'https://developers.google.com/youtube/v3',
    fields:[
      { key:'youtube', label:'OAuth 2.0 Access Token', placeholder:'ya29.xxxxxxxx...', hint:'Create credentials in Google Cloud Console → YouTube Data API v3' },
    ],
  },
  {
    id:'tiktok', name:'TikTok', color:'#69C9D0',
    docsUrl:'https://developers.tiktok.com/doc/login-kit-web',
    fields:[
      { key:'tiktok_client_key', label:'Client Key', placeholder:'awxxxxxxxxxxxxxxxx', hint:'From TikTok Developer Portal → My Apps → App Detail' },
      { key:'tiktok_client_secret', label:'Client Secret', placeholder:'sbxxxxxxxxxxxxxxxx', hint:'From TikTok Developer Portal → My Apps → App Detail' },
      { key:'tiktok', label:'Access Token', placeholder:'act.xxxxxx...', hint:'Obtained via TikTok OAuth flow (or automatically connected below)' },
    ],
  },
  {
    id:'linkedin', name:'LinkedIn', color:'#0A66C2',
    docsUrl:'https://learn.microsoft.com/en-us/linkedin/marketing/integrations',
    fields:[
      { key:'linkedin', label:'Access Token', placeholder:'AQVxxxxxx...', hint:'Create app at LinkedIn Developer Portal → OAuth 2.0 → 3-legged auth' },
      { key:'linkedin_urn', label:'Person/Organization URN', placeholder:'urn:li:person:xxxxxxxx', hint:'Returned from GET /v2/me with your access token' },
    ],
  },
  {
    id:'x', name:'X (Twitter)', color:'var(--color-x)',
    docsUrl:'https://developer.twitter.com/en/docs/twitter-api',
    fields:[
      { key:'x', label:'API Key', placeholder:'xxxxxxxxxxxxxxxxxxxxxx', hint:'From Twitter Developer Portal → Your App → Keys and Tokens' },
      { key:'x_secret', label:'API Secret', placeholder:'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', hint:'Found alongside API Key in Developer Portal' },
      { key:'x_access_token', label:'Access Token', placeholder:'0000000000-xxxxxxxxxxxxxxxxxxxxxx', hint:'Generate in Developer Portal → Access Token & Secret' },
      { key:'x_access_secret', label:'Access Token Secret', placeholder:'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', hint:'Found alongside Access Token' },
    ],
  },
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const email = session?.user?.email || undefined;
  const [keys, setKeys] = useState<ApiKeys>({});
  const [saved, setSaved] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState('facebook');
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [connectSuccess, setConnectSuccess] = useState<string | null>(null);
  const [hasProcessedCallback, setHasProcessedCallback] = useState(false);

  useEffect(() => {
    setKeys(getApiKeys(email));
  }, [email]);

  const handleTikTokConnect = () => {
    const clientKey = keys.tiktok_client_key;
    if (!clientKey) {
      setConnectError('Please enter and save your TikTok Client Key first.');
      return;
    }
    setConnectError(null);
    setConnectSuccess(null);
    const redirectUri = encodeURIComponent(window.location.origin + '/settings');
    const state = Math.random().toString(36).substring(2, 15);
    
    // Redirect to TikTok authorize page
    const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&scope=user.info.basic,video.publish&response_type=code&redirect_uri=${redirectUri}&state=${state}`;
    window.location.href = authUrl;
  };

  const handleTikTokCallback = async (code: string) => {
    setIsConnecting(true);
    setConnectError(null);
    setConnectSuccess(null);

    const clientKey = keys.tiktok_client_key;
    const clientSecret = keys.tiktok_client_secret;

    if (!clientKey || !clientSecret) {
      setConnectError('Missing Client Key or Client Secret. Please save them first.');
      setIsConnecting(false);
      return;
    }

    try {
      const redirectUri = window.location.origin + '/settings';
      const res = await fetch('/api/auth/tiktok/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          client_key: clientKey,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Token exchange failed');
      }

      // Update state and save
      const updatedKeys = {
        ...keys,
        tiktok: data.access_token,
        tiktok_refresh_token: data.refresh_token,
        tiktok_expires_at: Date.now() + data.expires_in * 1000,
      };
      setKeys(updatedKeys);
      saveApiKeys(updatedKeys, email);
      setConnectSuccess('TikTok account connected successfully!');
      
      // Clear URL query parameters
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : 'Failed to connect TikTok.');
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code && keys.tiktok_client_key && !hasProcessedCallback && !isConnecting) {
      setHasProcessedCallback(true);
      handleTikTokCallback(code);
    }
  }, [keys.tiktok_client_key, hasProcessedCallback]);

  const handleSave = () => {
    saveApiKeys(keys, email);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const update = (field: keyof ApiKeys, val: string) => setKeys(k => ({ ...k, [field]: val }));
  const toggleShow = (field: string) => setShowKeys(s => ({ ...s, [field]: !s[field] }));
  const hasKeys = (pc: PlatformConfig) => pc.fields.some(f => keys[f.key]);

  const activePlatform = PLATFORM_CONFIGS.find(p => p.id === activeTab)!;

  return (
    <div style={{ padding:'32px', maxWidth:980, margin:'0 auto' }}>
      <div style={{ marginBottom:28 }}>
        <h1 className="gradient-text" style={{ fontSize:28, fontWeight:800, marginBottom:6 }}>API Settings</h1>
        <p style={{ color:'var(--text-secondary)', fontSize:14 }}>Configure your social media API keys to enable cross-platform posting.</p>
      </div>

      {/* Security notice */}
      <div style={{ padding:'14px 18px', borderRadius:12, background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.25)', marginBottom:28, display:'flex', alignItems:'flex-start', gap:12 }}>
        <span style={{ fontSize:20 }}>🔒</span>
        <div>
          <div style={{ fontWeight:600, color:'#f59e0b', fontSize:13, marginBottom:3 }}>Security Notice</div>
          <div style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.6 }}>
            API keys are stored locally in your browser&apos;s localStorage and sent securely to the server only when posting. They are never stored on any external server. Use environment variables for production deployments.
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'200px 1fr', gap:24 }}>
        {/* Platform tabs (left) */}
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {PLATFORM_CONFIGS.map(pc => (
            <button key={pc.id}
              onClick={() => setActiveTab(pc.id)}
              style={{
                display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:10, border:'none', cursor:'pointer', fontFamily:'Inter,sans-serif', transition:'all 0.2s',
                background: activeTab===pc.id ? `${pc.color}18` : 'var(--bg-elevated)',
                borderLeft: activeTab===pc.id ? `3px solid ${pc.color}` : '3px solid transparent',
                textAlign:'left',
              }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill={pc.color}><path d={PLATFORM_SVG_PATHS[pc.id]} /></svg>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, color: activeTab===pc.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{pc.name}</div>
              </div>
              {hasKeys(pc) && <div style={{ width:7, height:7, borderRadius:'50%', background:'#10b981', flexShrink:0 }} />}
            </button>
          ))}
        </div>

        {/* Platform key form (right) */}
        <div className="glass fade-in" style={{ padding: 28 }}>
          {isConnecting && (
            <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(105, 201, 208, 0.08)', border: '1px solid rgba(105, 201, 208, 0.25)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(105, 201, 208, 0.4)', borderTopColor: '#69C9D0', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: '#69C9D0' }}>Exchanging TikTok authorization code... Please wait.</div>
            </div>
          )}

          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:24, paddingBottom:20, borderBottom:'1px solid var(--border)' }}>
            <div style={{ width:48, height:48, borderRadius:14, background:`${activePlatform.color}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill={activePlatform.color}><path d={PLATFORM_SVG_PATHS[activePlatform.id]} /></svg>
            </div>
            <div>
              <h2 style={{ fontSize:18, fontWeight:700, marginBottom:2 }}>{activePlatform.name}</h2>
              <a href={activePlatform.docsUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize:12, color:'#a78bfa', textDecoration:'none' }}>
                📖 View API Documentation →
              </a>
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            {activePlatform.fields.map(field => (
              <div key={field.key}>
                <label className="section-label">{field.label}</label>
                <div style={{ display:'flex', gap:8 }}>
                  <input
                    className="input-field"
                    type={showKeys[field.key] ? 'text' : 'password'}
                    placeholder={field.placeholder}
                    value={keys[field.key] || ''}
                    onChange={e => update(field.key, e.target.value)}
                    style={{ flex:1, fontFamily:'monospace', fontSize:13 }}
                    id={`key-${field.key}`}
                    autoComplete="off"
                  />
                  <button
                    onClick={() => toggleShow(field.key)}
                    style={{ width:42, borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-elevated)', cursor:'pointer', color:'var(--text-secondary)', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {showKeys[field.key] ? '🙈' : '👁️'}
                  </button>
                </div>
                <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:6, lineHeight:1.5 }}>
                  💡 {field.hint}
                </div>
              </div>
            ))}
          </div>

          {activePlatform.id === 'tiktok' && (
            <div style={{ marginTop: 24, padding: '18px', borderRadius: 12, background: 'rgba(105, 201, 208, 0.06)', border: '1px solid rgba(105, 201, 208, 0.25)', marginBottom: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#69C9D0', marginBottom: 6 }}>TikTok Account Connection</div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
                First, save your <strong>Client Key</strong> and <strong>Client Secret</strong>. Then click the button below to authorize this app on your TikTok account.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  className="btn-primary"
                  onClick={handleTikTokConnect}
                  disabled={isConnecting || !keys.tiktok_client_key || !keys.tiktok_client_secret}
                  style={{ background: 'linear-gradient(135deg, #69C9D0, #00f2fe)', color: '#000', fontWeight: 700, border: 'none' }}
                >
                  {isConnecting ? 'Connecting...' : keys.tiktok ? '🔄 Reconnect TikTok Account' : '🔗 Connect TikTok Account'}
                </button>
                {keys.tiktok_expires_at && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Token expires: {new Date(keys.tiktok_expires_at).toLocaleString()}
                  </div>
                )}
              </div>
              
              {connectSuccess && (
                <div style={{ color: '#10b981', fontSize: 13, marginTop: 12, fontWeight: 500 }}>
                  ✅ {connectSuccess}
                </div>
              )}
              {connectError && (
                <div style={{ color: '#ef4444', fontSize: 13, marginTop: 12, fontWeight: 500 }}>
                  ❌ {connectError}
                </div>
              )}
            </div>
          )}

          {/* How to get keys guide */}
          <div style={{ marginTop:28, padding:18, borderRadius:12, background:'var(--bg-elevated)', border:'1px solid var(--border)' }}>
            <div className="section-label">How to Get Your API Keys</div>
            <div style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.8 }}>
              {activePlatform.id==='facebook' && <>1. Go to <strong>developers.facebook.com</strong><br/>2. Create an App → Business type<br/>3. Add <strong>Pages API</strong> product<br/>4. Use Graph API Explorer to generate a Page Access Token<br/>5. Request permissions: <code style={{fontSize:11}}>pages_manage_posts, pages_read_engagement</code></>}
              {activePlatform.id==='instagram' && <>1. Instagram API requires a <strong>Facebook Business account</strong><br/>2. Connect your Instagram account to a Facebook Page<br/>3. Use Graph API Explorer with <code style={{fontSize:11}}>instagram_basic, instagram_content_publish</code><br/>4. Get your Instagram Business Account ID via <code style={{fontSize:11}}>GET /me/accounts</code></>}
              {activePlatform.id==='youtube' && <>1. Go to <strong>console.cloud.google.com</strong><br/>2. Enable <strong>YouTube Data API v3</strong><br/>3. Create OAuth 2.0 credentials (Web Application)<br/>4. Use OAuth Playground to get access token<br/>5. Scopes needed: <code style={{fontSize:11}}>https://www.googleapis.com/auth/youtube.upload</code></>}
              {activePlatform.id==='tiktok' && <>1. Go to <strong>developers.tiktok.com</strong><br/>2. Register as a developer and create an app<br/>3. Add <strong>Content Posting API</strong> product<br/>4. Implement Login Kit OAuth to get access token<br/>5. Scopes: <code style={{fontSize:11}}>video.publish, user.info.basic</code></>}
              {activePlatform.id==='linkedin' && <>1. Go to <strong>linkedin.com/developers</strong><br/>2. Create an app and request <strong>Marketing Developer Platform</strong> access<br/>3. Add OAuth 2.0 scopes: <code style={{fontSize:11}}>w_member_social, r_liteprofile</code><br/>4. Use 3-legged OAuth to generate access token<br/>5. Get your member URN via <code style={{fontSize:11}}>GET /v2/me</code></>}
              {activePlatform.id==='x' && <>1. Go to <strong>developer.twitter.com</strong><br/>2. Apply for Elevated access (needed for posting)<br/>3. Create a Project and App<br/>4. Generate API Key, API Secret, Access Token & Secret<br/>5. Ensure your app has <strong>Read and Write</strong> permissions</>}
            </div>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div style={{ display:'flex', justifyContent:'flex-end', marginTop:24, gap:12 }}>
        <button className="btn-secondary" onClick={() => { setKeys({}); saveApiKeys({}); }}>Clear All Keys</button>
        <button className="btn-primary" onClick={handleSave} style={{ minWidth:140, justifyContent:'center' }}>
          {saved ? '✅ Saved!' : '💾 Save API Keys'}
        </button>
      </div>
    </div>
  );
}
