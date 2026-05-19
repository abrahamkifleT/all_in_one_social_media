'use client';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { MediaFile, ContentType } from '@/lib/types';

interface Props {
  contentType: ContentType;
  onContentTypeChange: (t: ContentType) => void;
  media: MediaFile | null;
  onMediaChange: (m: MediaFile | null) => void;
  text: string;
  onTextChange: (t: string) => void;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

export default function MediaUploader({ contentType, onContentTypeChange, media, onMediaChange, text, onTextChange }: Props) {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    const mf: MediaFile = {
      id: Math.random().toString(36).slice(2),
      name: file.name,
      type: isVideo ? 'video' : isImage ? 'image' : 'text',
      url,
      size: file.size,
      mimeType: file.type,
    };
    onMediaChange(mf);
    if (isVideo) onContentTypeChange('video');
    else if (isImage) onContentTypeChange('image');
    setDragActive(false);
  }, [onMediaChange, onContentTypeChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    accept: contentType === 'text' ? {} : contentType === 'image'
      ? { 'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'] }
      : { 'video/*': ['.mp4', '.mov', '.avi', '.webm'] },
    maxFiles: 1,
    disabled: contentType === 'text',
  });

  const TYPES: { id: ContentType; label: string; icon: string }[] = [
    { id: 'text', label: 'Text Only', icon: 'M4 6h16M4 10h16M4 14h10' },
    { id: 'image', label: 'Image', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'video', label: 'Video', icon: 'M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
  ];

  return (
    <div>
      {/* Content type tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => { onContentTypeChange(t.id); onMediaChange(null); }}
            style={{
              flex: 1, padding: '8px 12px', borderRadius: 10,
              border: contentType === t.id ? '1px solid rgba(124,58,237,0.5)' : '1px solid var(--border)',
              background: contentType === t.id ? 'rgba(124,58,237,0.15)' : 'var(--bg-elevated)',
              color: contentType === t.id ? '#a78bfa' : 'var(--text-secondary)',
              cursor: 'pointer', fontWeight: 600, fontSize: 13,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
            }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d={t.icon} />
            </svg>
            {t.label}
          </button>
        ))}
      </div>

      {/* Text editor */}
      {contentType === 'text' ? (
        <div>
          <textarea
            className="input-field"
            placeholder="Write your post content here... Be descriptive, engaging, and include a call-to-action!"
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            style={{ minHeight: 160, lineHeight: 1.6 }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>
            {text.length} characters
          </div>
        </div>
      ) : (
        <>
          {/* Dropzone */}
          {!media ? (
            <div
              {...getRootProps()}
              className={`dropzone ${isDragActive || dragActive ? 'active' : ''}`}>
              <input {...getInputProps()} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: 'rgba(124,58,237,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="28" height="28" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d={contentType === 'image'
                      ? 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                      : 'M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
                    } />
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Drop your {contentType} here
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {contentType === 'image'
                      ? 'JPG, PNG, GIF, WebP supported'
                      : 'MP4, MOV, AVI, WebM supported'}
                  </div>
                </div>
                <div style={{
                  padding: '6px 16px', borderRadius: 8,
                  background: 'rgba(124,58,237,0.2)', color: '#a78bfa',
                  fontSize: 13, fontWeight: 500,
                }}>
                  Browse Files
                </div>
              </div>
            </div>
          ) : (
            /* Preview */
            <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--bg-elevated)', border: '1px solid var(--border)', position: 'relative' }}>
              {media.type === 'image' ? (
                <img src={media.url} alt={media.name} style={{ width: '100%', maxHeight: 280, objectFit: 'cover', display: 'block' }} />
              ) : (
                <video src={media.url} controls style={{ width: '100%', maxHeight: 280, display: 'block' }} />
              )}
              <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{media.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatBytes(media.size)}</div>
                </div>
                <button
                  onClick={() => onMediaChange(null)}
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                  Remove
                </button>
              </div>
            </div>
          )}

          {/* Caption (always visible for image/video) */}
          <div style={{ marginTop: 12 }}>
            <textarea
              className="input-field"
              placeholder="Add a caption or description for your media..."
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
              style={{ minHeight: 80, lineHeight: 1.6 }}
            />
          </div>
        </>
      )}
    </div>
  );
}
