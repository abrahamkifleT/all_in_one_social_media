'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { getPosts, getPostsByDate } from '@/lib/storage';
import { Post, PlatformId } from '@/lib/types';
import { PLATFORM_SVG_PATHS } from '@/lib/platforms';

const PLATFORM_COLORS: Record<string, string> = {
  facebook: '#1877F2', instagram: '#E1306C', youtube: '#FF0000',
  tiktok: '#69C9D0', linkedin: '#0A66C2', x: 'var(--color-x)',
};
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function toYMD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const email = session?.user?.email || undefined;
  const [posts, setPosts] = useState<Post[]>([]);
  const [now] = useState(new Date());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    setPosts(getPosts(email));
  }, [email]);

  const todayStr = toYMD(now);
  const postDates = new Set(posts.map(p => (p.scheduledAt || p.publishedAt || p.createdAt).slice(0, 10)));

  // Build calendar grid
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const prevDays = new Date(calYear, calMonth, 0).getDate();
  const cells: { date: string; day: number; current: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ date: toYMD(new Date(calYear, calMonth - 1, prevDays - i)), day: prevDays - i, current: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ date: toYMD(new Date(calYear, calMonth, d)), day: d, current: true });
  while (cells.length % 7 !== 0) { const extra = cells.length - daysInMonth - firstDay + 1; cells.push({ date: toYMD(new Date(calYear, calMonth + 1, extra)), day: extra, current: false }); }

  const dayPosts = selectedDay ? getPostsByDate(selectedDay, email) : [];
  const published = posts.filter(p => p.status === 'published').length;
  const scheduled = posts.filter(p => p.status === 'scheduled').length;
  const failed = posts.filter(p => p.status === 'failed').length;
  const recentPosts = posts.slice(0, 5);

  return (
    <div style={{ padding: '32px 32px 32px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 className="gradient-text" style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          {now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Posts', value: posts.length, color: '#a78bfa', bg: 'rgba(124,58,237,0.12)', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
          { label: 'Published', value: published, color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Scheduled', value: scheduled, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
          { label: 'Failed', value: failed, color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' },
        ].map(s => (
          <div key={s.label} className="glass" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="22" height="22" fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d={s.icon} />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
        {/* Calendar */}
        <div className="glass" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>{MONTHS[calMonth]} {calYear}</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); }}
                style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 16 }}>‹</button>
              <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); }}
                style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 16 }}>›</button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
            {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', padding: '4px 0' }}>{d}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {cells.map(cell => (
              <div key={cell.date}
                className={`cal-day ${cell.date === todayStr ? 'today' : ''} ${!cell.current ? 'other-month' : ''} ${postDates.has(cell.date) ? 'has-posts' : ''}`}
                onClick={() => setSelectedDay(selectedDay === cell.date ? null : cell.date)}
                style={{ border: selectedDay === cell.date ? '1px solid rgba(124,58,237,0.5)' : '1px solid transparent' }}>
                <span style={{ fontSize: 13, fontWeight: cell.date === todayStr ? 700 : 400 }}>{cell.day}</span>
              </div>
            ))}
          </div>
          {selectedDay && (
            <div style={{ marginTop: 16, padding: 14, borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#a78bfa' }}>
                Posts on {new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </div>
              {dayPosts.length === 0
                ? <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No posts this day.</div>
                : dayPosts.map(p => (
                  <div key={p.id} style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                    <span className={`badge badge-${p.status}`} style={{ marginRight: 8 }}>{p.status}</span>
                    {p.textContent?.slice(0, 50) || p.metadata.title || 'Media post'}
                  </div>
                ))
              }
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Quick compose CTA */}
          <div className="gradient-border">
            <div style={{ padding: '20px 24px', background: 'var(--bg-card)', borderRadius: 15 }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>✨ Create New Post</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Post to all your platforms with one click</div>
              <Link href="/compose">
                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeLinecap="round"/></svg>
                  Compose Post
                </button>
              </Link>
            </div>
          </div>

          {/* Recent posts */}
          <div className="glass" style={{ padding: 20, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Recent Posts</h3>
              <Link href="/history" style={{ fontSize: 12, color: '#a78bfa', textDecoration: 'none' }}>View all →</Link>
            </div>
            {recentPosts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>No posts yet. Create your first post!</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentPosts.map(post => (
                  <div key={post.id} style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span className={`badge badge-${post.status}`}>{post.status}</span>
                      <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
                        {post.platforms.slice(0, 3).map(pid => (
                          <svg key={pid} width="14" height="14" viewBox="0 0 24 24" fill={PLATFORM_COLORS[pid] || '#888'}>
                            <path d={PLATFORM_SVG_PATHS[pid]} />
                          </svg>
                        ))}
                        {post.platforms.length > 3 && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>+{post.platforms.length - 3}</span>}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {post.metadata.title || post.textContent?.slice(0, 60) || 'Media post'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
