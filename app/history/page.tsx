'use client';
import { useState, useEffect } from 'react';
import { Post } from '@/lib/types';
import { getPosts, deletePost } from '@/lib/storage';
import { PLATFORM_SVG_PATHS } from '@/lib/platforms';

const PLATFORM_COLORS: Record<string, string> = {
  facebook:'#1877F2', instagram:'#E1306C', youtube:'#FF0000',
  tiktok:'#69C9D0', linkedin:'#0A66C2', x:'#ffffff',
};

type FilterStatus = 'all' | 'published' | 'scheduled' | 'draft' | 'failed';

export default function HistoryPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { setPosts(getPosts()); }, []);

  const filtered = posts.filter(p => {
    const matchStatus = filter === 'all' || p.status === filter;
    const matchSearch = !search || (p.textContent?.toLowerCase().includes(search.toLowerCase())) || (p.metadata.title?.toLowerCase().includes(search.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const handleDelete = (id: string) => {
    deletePost(id);
    setPosts(getPosts());
  };

  const FILTERS: { id: FilterStatus; label: string; color: string }[] = [
    { id:'all', label:'All', color:'#a78bfa' },
    { id:'published', label:'Published', color:'#10b981' },
    { id:'scheduled', label:'Scheduled', color:'#f59e0b' },
    { id:'draft', label:'Drafts', color:'#8888aa' },
    { id:'failed', label:'Failed', color:'#ef4444' },
  ];

  return (
    <div style={{ padding:'32px', maxWidth:900, margin:'0 auto' }}>
      <div style={{ marginBottom:28 }}>
        <h1 className="gradient-text" style={{ fontSize:28, fontWeight:800, marginBottom:6 }}>Post History</h1>
        <p style={{ color:'var(--text-secondary)', fontSize:14 }}>All your posts across every platform — published, scheduled, and drafts.</p>
      </div>

      {/* Filters + Search */}
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24, flexWrap:'wrap' }}>
        <div style={{ display:'flex', gap:6 }}>
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              style={{
                padding:'7px 14px', borderRadius:20, border:'none', cursor:'pointer',
                fontFamily:'Inter,sans-serif', fontSize:12, fontWeight:600, transition:'all 0.2s',
                background: filter===f.id ? `${f.color}22` : 'var(--bg-elevated)',
                color: filter===f.id ? f.color : 'var(--text-muted)',
                border: filter===f.id ? `1px solid ${f.color}44` : '1px solid var(--border)',
              }}>
              {f.label}
              <span style={{ marginLeft:6, background:'var(--bg-card)', borderRadius:10, padding:'1px 6px' }}>
                {f.id==='all' ? posts.length : posts.filter(p=>p.status===f.id).length}
              </span>
            </button>
          ))}
        </div>
        <input
          className="input-field"
          placeholder="Search posts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth:260, marginLeft:'auto' }}
        />
      </div>

      {/* Post list */}
      {filtered.length === 0 ? (
        <div className="glass" style={{ padding:'60px 20px', textAlign:'center' }}>
          <div style={{ fontSize:48, marginBottom:16 }}>📭</div>
          <div style={{ fontSize:18, fontWeight:600, marginBottom:8 }}>No posts found</div>
          <div style={{ fontSize:14, color:'var(--text-muted)' }}>
            {posts.length === 0 ? "You haven't created any posts yet." : 'Try a different filter or search term.'}
          </div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {filtered.map(post => (
            <div key={post.id} className="glass glass-hover" style={{ borderRadius:14, overflow:'hidden' }}>
              {/* Main row */}
              <div style={{ padding:'16px 20px', display:'flex', alignItems:'center', gap:16, cursor:'pointer' }}
                onClick={() => setExpanded(expanded===post.id ? null : post.id)}>

                {/* Content type icon */}
                <div style={{ width:42, height:42, borderRadius:12, background:'var(--bg-elevated)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ fontSize:20 }}>
                    {post.contentType==='video' ? '🎬' : post.contentType==='image' ? '🖼️' : '📝'}
                  </span>
                </div>

                {/* Text */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, fontSize:14, marginBottom:4, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                    {post.metadata.title || post.textContent?.slice(0,80) || 'Media post'}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                    <span className={`badge badge-${post.status}`}>{post.status}</span>
                    <span style={{ fontSize:11, color:'var(--text-muted)' }}>
                      {new Date(post.createdAt).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                    </span>
                    {post.metadata.hashtags.length > 0 && (
                      <span style={{ fontSize:11, color:'var(--text-muted)' }}>{post.metadata.hashtags.length} hashtags</span>
                    )}
                  </div>
                </div>

                {/* Platform icons */}
                <div style={{ display:'flex', gap:6, alignItems:'center', flexShrink:0 }}>
                  {post.platforms.map(pid => (
                    <div key={pid} style={{ width:28, height:28, borderRadius:8, background:`${PLATFORM_COLORS[pid]}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={PLATFORM_COLORS[pid]}><path d={PLATFORM_SVG_PATHS[pid]} /></svg>
                    </div>
                  ))}
                </div>

                {/* Chevron */}
                <div style={{ color:'var(--text-muted)', fontSize:18, transition:'transform 0.2s', transform: expanded===post.id ? 'rotate(90deg)' : 'none' }}>›</div>
              </div>

              {/* Expanded details */}
              {expanded === post.id && (
                <div style={{ padding:'0 20px 20px', borderTop:'1px solid var(--border)' }}>
                  <div style={{ paddingTop:16, display:'flex', flexDirection:'column', gap:14 }}>
                    {/* Preview */}
                    {post.media?.type==='image' && (
                      <img src={post.media.url} alt="post" style={{ maxHeight:180, objectFit:'cover', borderRadius:10, maxWidth:320 }} />
                    )}
                    {post.textContent && (
                      <div style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.7, whiteSpace:'pre-wrap' }}>{post.textContent}</div>
                    )}

                    {/* Hashtags */}
                    {post.metadata.hashtags.length > 0 && (
                      <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                        {post.metadata.hashtags.map(h=><span key={h} className="tag-pill" style={{fontSize:11}}>#{h}</span>)}
                      </div>
                    )}

                    {/* Results per platform */}
                    {post.results && post.results.length > 0 && (
                      <div>
                        <div className="section-label">Platform Results</div>
                        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                          {post.results.map(r => (
                            <div key={r.platform} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', borderRadius:8, background: r.success?'rgba(16,185,129,0.07)':'rgba(239,68,68,0.07)', border:`1px solid ${r.success?'rgba(16,185,129,0.2)':'rgba(239,68,68,0.2)'}` }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill={PLATFORM_COLORS[r.platform]}><path d={PLATFORM_SVG_PATHS[r.platform]} /></svg>
                              <span style={{ fontSize:13, fontWeight:600, textTransform:'capitalize' }}>{r.platform}</span>
                              <span style={{ fontSize:12, color:'var(--text-muted)', flex:1 }}>{r.error || (r.success?'Success':'Failed')}</span>
                              <span>{r.success?'✅':'❌'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display:'flex', gap:10, marginTop:4 }}>
                      <button onClick={() => handleDelete(post.id)} style={{ padding:'7px 14px', borderRadius:8, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.08)', color:'#ef4444', cursor:'pointer', fontSize:12, fontWeight:600, fontFamily:'Inter,sans-serif' }}>
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
