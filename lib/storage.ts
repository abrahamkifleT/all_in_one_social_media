'use client';
import { Post, ApiKeys } from './types';

const POSTS_KEY = 'socialhub_posts';
const KEYS_KEY = 'socialhub_apikeys';

// Posts
export function getPosts(): Post[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(POSTS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function savePost(post: Post): void {
  const posts = getPosts();
  const idx = posts.findIndex((p) => p.id === post.id);
  if (idx >= 0) posts[idx] = post;
  else posts.unshift(post);
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

export function deletePost(id: string): void {
  const posts = getPosts().filter((p) => p.id !== id);
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

export function getPostsByDate(dateStr: string): Post[] {
  return getPosts().filter((p) => {
    const d = p.scheduledAt || p.publishedAt || p.createdAt;
    return d.startsWith(dateStr);
  });
}

// API Keys
export function getApiKeys(): ApiKeys {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(KEYS_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveApiKeys(keys: ApiKeys): void {
  localStorage.setItem(KEYS_KEY, JSON.stringify(keys));
}
