'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PLATFORM_SVG_PATHS } from '@/lib/platforms';

const NAV = [
  { href: '/', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/compose', label: 'Compose Post', icon: 'M12 4v16m8-8H4', compose: true },
  { href: '/history', label: 'Post History', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { href: '/settings', label: 'API Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

const PLATFORMS = ['facebook', 'instagram', 'youtube', 'tiktok', 'linkedin', 'x'];
const PLATFORM_COLORS: Record<string, string> = {
  facebook: '#1877F2', instagram: '#E1306C', youtube: '#FF0000',
  tiktok: '#69C9D0', linkedin: '#0A66C2', x: '#ffffff',
};
const PLATFORM_NAMES: Record<string, string> = {
  facebook: 'Facebook', instagram: 'Instagram', youtube: 'YouTube',
  tiktok: 'TikTok', linkedin: 'LinkedIn', x: 'X',
};

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: 240,
      minHeight: '100vh',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #7c3aed, #60a5fa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800, color: 'white',
          }}>S</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>SocialHub</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>ALL-IN-ONE POSTER</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 32 }}>
        <div className="section-label">Menu</div>
        {NAV.map((item) => (
          <Link key={item.href} href={item.href}
            className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
            style={item.compose ? {
              background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(96,165,250,0.2))',
              border: '1px solid rgba(124,58,237,0.4)',
              color: '#a78bfa',
              marginTop: 4,
            } : undefined}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d={item.icon} />
            </svg>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Platforms */}
      <div style={{ flex: 1 }}>
        <div className="section-label">Platforms</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {PLATFORMS.map((p) => (
            <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', borderRadius: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 6,
                background: 'var(--bg-elevated)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill={PLATFORM_COLORS[p]}>
                  <path d={PLATFORM_SVG_PATHS[p]} />
                </svg>
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{PLATFORM_NAMES[p]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 16 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
          SocialHub v1.0 — Vercel Ready
        </div>
      </div>
    </aside>
  );
}
