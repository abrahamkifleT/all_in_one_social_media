'use client';
import { useState, KeyboardEvent } from 'react';
import { PostMetadata } from '@/lib/types';

interface Props {
  metadata: PostMetadata;
  onChange: (m: PostMetadata) => void;
}

const SUGGESTED: string[] = ['viral','trending','explore','fyp','foryou','content','creator','business','entrepreneur','marketing','tech','innovation','lifestyle','motivation','inspiration'];
const CATEGORIES = ['Entertainment','Education','Technology','Business','Lifestyle','Travel','Food','Fashion','Sports','Music','Gaming','News'];
const LANGUAGES = ['English','Spanish','French','German','Portuguese','Arabic','Japanese','Korean','Chinese','Hindi'];

export default function MetadataPanel({ metadata, onChange }: Props) {
  const [hashInput, setHashInput] = useState('');
  const [mentionInput, setMentionInput] = useState('');
  const [tab, setTab] = useState<'seo'|'schedule'|'advanced'>('seo');

  const addHash = (tag: string) => {
    const clean = tag.replace(/^#/,'').trim().replace(/\s+/g,'_');
    if (!clean || metadata.hashtags.includes(clean)) return;
    onChange({ ...metadata, hashtags: [...metadata.hashtags, clean] });
    setHashInput('');
  };
  const removeHash = (t: string) => onChange({ ...metadata, hashtags: metadata.hashtags.filter(h => h !== t) });

  const addMention = (m: string) => {
    const clean = m.replace(/^@/,'').trim();
    if (!clean || metadata.mentions.includes(clean)) return;
    onChange({ ...metadata, mentions: [...metadata.mentions, clean] });
    setMentionInput('');
  };
  const removeMention = (m: string) => onChange({ ...metadata, mentions: metadata.mentions.filter(x => x !== m) });

  const onHashKey = (e: KeyboardEvent<HTMLInputElement>) => { if(e.key==='Enter'||e.key===' '||e.key===','){e.preventDefault();addHash(hashInput);} };
  const onMentionKey = (e: KeyboardEvent<HTMLInputElement>) => { if(e.key==='Enter'||e.key===','||e.key===' '){e.preventDefault();addMention(mentionInput);} };

  const TABS = [{id:'seo',label:'🎯 SEO & Reach'},{id:'schedule',label:'🕐 Schedule'},{id:'advanced',label:'⚙️ Advanced'}];

  return (
    <div>
      <div style={{display:'flex',gap:4,marginBottom:20,background:'var(--bg-elevated)',borderRadius:10,padding:4}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id as typeof tab)} style={{flex:1,padding:'7px 8px',borderRadius:8,border:'none',cursor:'pointer',fontFamily:'Inter,sans-serif',fontSize:12,fontWeight:600,transition:'all 0.2s',background:tab===t.id?'var(--bg-card)':'transparent',color:tab===t.id?'var(--text-primary)':'var(--text-muted)',boxShadow:tab===t.id?'0 1px 6px rgba(0,0,0,0.3)':'none'}}>
            {t.label}
          </button>
        ))}
      </div>

      {tab==='seo' && (
        <div style={{display:'flex',flexDirection:'column',gap:18}}>
          <div>
            <div className="section-label">Post Title / Headline</div>
            <input className="input-field" placeholder="Eye-catching title for YouTube, LinkedIn..." value={metadata.title||''} onChange={e=>onChange({...metadata,title:e.target.value})} />
          </div>
          <div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
              <div className="section-label" style={{marginBottom:0}}>Hashtags</div>
              <span style={{fontSize:11,color:'var(--text-muted)'}}>{metadata.hashtags.length} added</span>
            </div>
            <div style={{display:'flex',gap:8,marginBottom:10}}>
              <input className="input-field" placeholder="Type hashtag + Enter" value={hashInput} onChange={e=>setHashInput(e.target.value)} onKeyDown={onHashKey} style={{flex:1}} />
              <button className="btn-primary" style={{padding:'10px 14px',flexShrink:0}} onClick={()=>addHash(hashInput)}>+</button>
            </div>
            {metadata.hashtags.length>0 && (
              <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:10}}>
                {metadata.hashtags.map(tag=>(
                  <span key={tag} className="tag-pill">#{tag}<button onClick={()=>removeHash(tag)}>×</button></span>
                ))}
              </div>
            )}
            <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:6}}>Quick Add:</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
              {SUGGESTED.map(tag=>(
                <button key={tag} onClick={()=>addHash(tag)} disabled={metadata.hashtags.includes(tag)} style={{fontSize:11,padding:'3px 8px',borderRadius:20,border:'1px solid var(--border)',background:'var(--bg-elevated)',color:metadata.hashtags.includes(tag)?'var(--text-muted)':'var(--text-secondary)',cursor:metadata.hashtags.includes(tag)?'default':'pointer',fontFamily:'Inter,sans-serif'}}>
                  #{tag}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="section-label">Tag / Mentions (@username)</div>
            <div style={{display:'flex',gap:8,marginBottom:8}}>
              <input className="input-field" placeholder="@username + Enter" value={mentionInput} onChange={e=>setMentionInput(e.target.value)} onKeyDown={onMentionKey} style={{flex:1}} />
              <button className="btn-primary" style={{padding:'10px 14px',flexShrink:0}} onClick={()=>addMention(mentionInput)}>+</button>
            </div>
            {metadata.mentions.length>0 && (
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {metadata.mentions.map(m=>(
                  <span key={m} className="tag-pill" style={{background:'rgba(96,165,250,0.12)',borderColor:'rgba(96,165,250,0.3)',color:'#60a5fa'}}>@{m}<button onClick={()=>removeMention(m)}>×</button></span>
                ))}
              </div>
            )}
          </div>
          <div>
            <div className="section-label">Location (Optional)</div>
            <input className="input-field" placeholder="e.g. New York, NY" value={metadata.location||''} onChange={e=>onChange({...metadata,location:e.target.value})} />
          </div>
          <div>
            <div className="section-label">Alt Text (Accessibility & SEO)</div>
            <input className="input-field" placeholder="Describe your image/video for screen readers..." value={metadata.altText||''} onChange={e=>onChange({...metadata,altText:e.target.value})} />
          </div>
        </div>
      )}

      {tab==='schedule' && (
        <div style={{display:'flex',flexDirection:'column',gap:18}}>
          <div style={{padding:16,borderRadius:12,background:'rgba(124,58,237,0.08)',border:'1px solid rgba(124,58,237,0.2)'}}>
            <div style={{fontWeight:600,marginBottom:4,color:'var(--text-primary)',fontSize:14}}>📅 Schedule Your Post</div>
            <div style={{fontSize:12,color:'var(--text-secondary)',lineHeight:1.5}}>Leave empty to post immediately, or pick a date & time.</div>
          </div>
          <div>
            <div className="section-label">Scheduled Date & Time</div>
            <input type="datetime-local" className="input-field" value={metadata.scheduledAt?.slice(0,16)||''} onChange={e=>onChange({...metadata,scheduledAt:e.target.value?new Date(e.target.value).toISOString():undefined})} style={{colorScheme:'dark'}} />
          </div>
          <div style={{padding:16,borderRadius:12,background:'var(--bg-elevated)',border:'1px solid var(--border)'}}>
            <div className="section-label">⚡ Best Times to Post</div>
            <div style={{display:'flex',flexDirection:'column',gap:8,fontSize:13}}>
              {[['📘 Facebook','Wed–Fri, 1–3 PM'],['📸 Instagram','Mon–Thu, 11 AM–1 PM'],['▶️ YouTube','Thu–Sat, 12–4 PM'],['🎵 TikTok','Tue–Thu, 7–9 PM'],['💼 LinkedIn','Tue–Wed, 8–10 AM'],['𝕏 X','Mon–Wed, 9 AM–12 PM']].map(([p,t])=>(
                <div key={p} style={{display:'flex',justifyContent:'space-between',color:'var(--text-secondary)'}}>
                  <span>{p}</span><span style={{color:'#a78bfa',fontWeight:500}}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab==='advanced' && (
        <div style={{display:'flex',flexDirection:'column',gap:18}}>
          <div>
            <div className="section-label">Content Category</div>
            <select className="input-field" value={metadata.category||''} onChange={e=>onChange({...metadata,category:e.target.value})} style={{background:'var(--bg-elevated)',colorScheme:'dark'}}>
              <option value="">Select a category...</option>
              {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <div className="section-label">Content Language</div>
            <select className="input-field" value={metadata.language||''} onChange={e=>onChange({...metadata,language:e.target.value})} style={{background:'var(--bg-elevated)',colorScheme:'dark'}}>
              <option value="">Select language...</option>
              {LANGUAGES.map(l=><option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderRadius:12,background:'var(--bg-elevated)',border:'1px solid var(--border)'}}>
            <input type="checkbox" id="sponsored" checked={!!metadata.isSponsored} onChange={e=>onChange({...metadata,isSponsored:e.target.checked})} style={{width:18,height:18,accentColor:'#7c3aed',cursor:'pointer'}} />
            <div>
              <label htmlFor="sponsored" style={{fontWeight:600,fontSize:14,cursor:'pointer'}}>Paid Partnership / Sponsored</label>
              <div style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>Mark as sponsored content per platform guidelines</div>
            </div>
          </div>
          <div style={{padding:16,borderRadius:12,background:'rgba(16,185,129,0.06)',border:'1px solid rgba(16,185,129,0.2)'}}>
            <div style={{fontWeight:600,color:'#10b981',marginBottom:10,fontSize:13}}>✅ SEO Best Practices</div>
            <ul style={{fontSize:12,color:'var(--text-secondary)',listStyle:'none',display:'flex',flexDirection:'column',gap:6}}>
              {['3–5 highly relevant hashtags outperform 30 generic ones','Add location for local discovery','Keywords in title/caption help search algorithms','Alt text improves accessibility & image indexing','Engage in first hour — reply to comments quickly','Post consistently at the same times each week'].map(tip=>(
                <li key={tip} style={{paddingLeft:14,position:'relative'}}><span style={{position:'absolute',left:0,color:'#10b981'}}>→</span>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
