'use client';
import { Post, ApiKeys } from './types';

const POSTS_KEY = 'socialhub_posts';
const KEYS_KEY = 'socialhub_apikeys';

function getScopedKey(baseKey: string, email?: string): string {
  return email ? `${baseKey}_${email.toLowerCase()}` : baseKey;
}

// Posts
export function getPosts(email?: string): Post[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(getScopedKey(POSTS_KEY, email)) || '[]');
  } catch {
    return [];
  }
}

export function savePost(post: Post, email?: string): void {
  const posts = getPosts(email);
  const idx = posts.findIndex((p) => p.id === post.id);
  if (idx >= 0) posts[idx] = post;
  else posts.unshift(post);
  localStorage.setItem(getScopedKey(POSTS_KEY, email), JSON.stringify(posts));
}

export function deletePost(id: string, email?: string): void {
  const posts = getPosts(email).filter((p) => p.id !== id);
  localStorage.setItem(getScopedKey(POSTS_KEY, email), JSON.stringify(posts));
}

export function getPostsByDate(dateStr: string, email?: string): Post[] {
  return getPosts(email).filter((p) => {
    const d = p.scheduledAt || p.publishedAt || p.createdAt;
    return d.startsWith(dateStr);
  });
}

// API Keys
export function getApiKeys(email?: string): ApiKeys {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(getScopedKey(KEYS_KEY, email)) || '{}');
  } catch {
    return {};
  }
}

export function saveApiKeys(keys: ApiKeys, email?: string): void {
  localStorage.setItem(getScopedKey(KEYS_KEY, email), JSON.stringify(keys));
}
