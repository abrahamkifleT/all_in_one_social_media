'use client';
import { PLATFORMS, PLATFORM_SVG_PATHS } from '@/lib/platforms';
import { PlatformId, ContentType } from '@/lib/types';

interface Props {
  selected: PlatformId[];
  onChange: (platforms: PlatformId[]) => void;
  contentType: ContentType;
}

export default function PlatformSelector({ selected, onChange, contentType }: Props) {
  const toggle = (id: PlatformId) => {
    if (selected.includes(id)) onChange(selected.filter((p) => p !== id));
    else onChange([...selected, id]);
  };

  const selectAll = () => {
    const compatible = PLATFORMS
      .filter((p) => {
        if (contentType === 'text') return p.supportsText;
        if (contentType === 'image') return p.supportsImage;
        if (contentType === 'video') return p.supportsVideo;
        return true;
      })
      .map((p) => p.id);
    onChange(compatible);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div className="section-label" style={{ marginBottom: 0 }}>Select Platforms</div>
        <button onClick={selectAll} style={{
          fontSize: 12, color: '#a78bfa', background: 'none', border: 'none',
          cursor: 'pointer', fontWeight: 500, fontFamily: 'Inter, sans-serif',
        }}>Select All Compatible</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {PLATFORMS.map((platform) => {
          const isSelected = selected.includes(platform.id);
          const isCompatible =
            (contentType === 'text' && platform.supportsText) ||
            (contentType === 'image' && platform.supportsImage) ||
            (contentType === 'video' && platform.supportsVideo);
          const isDisabled = !isCompatible;

          return (
            <div
              key={platform.id}
              id={`platform-${platform.id}`}
              className={`platform-card ${isSelected ? 'selected' : ''}`}
              onClick={() => !isDisabled && toggle(platform.id)}
              style={{
                opacity: isDisabled ? 0.35 : 1,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                border: isSelected ? `1px solid ${platform.color}40` : undefined,
                boxShadow: isSelected ? `0 0 16px ${platform.color}20` : undefined,
                background: isSelected ? `${platform.color}12` : undefined,
                position: 'relative',
              }}>
              {/* Checkbox top-right */}
              <div style={{
                position: 'absolute', top: 8, right: 8,
                width: 18, height: 18, borderRadius: 5,
                border: isSelected ? `2px solid ${platform.color}` : '2px solid var(--border)',
                background: isSelected ? platform.color : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}>
                {isSelected && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: isSelected ? `${platform.color}22` : 'var(--bg-card)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={platform.color}>
                    <path d={PLATFORM_SVG_PATHS[platform.id]} />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {platform.name}
                  </div>
                  {platform.charLimit && (
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                      {platform.charLimit.toLocaleString()} chars
                    </div>
                  )}
                </div>
              </div>

              {isDisabled && (
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6, fontStyle: 'italic' }}>
                  Not supported
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
