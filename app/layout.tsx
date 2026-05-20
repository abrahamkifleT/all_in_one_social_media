import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SocialHub — All-in-One Social Media Poster',
  description: 'Post videos, images, and text to Facebook, TikTok, YouTube, Instagram, LinkedIn, and X from one powerful dashboard.',
  keywords: 'social media, post scheduler, facebook, instagram, youtube, tiktok, linkedin, twitter, x, content creator',
  openGraph: {
    title: 'SocialHub — All-in-One Social Media Poster',
    description: 'Manage and post to all your social media platforms from one place.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              const savedTheme = localStorage.getItem('theme');
              if (savedTheme === 'light') {
                document.documentElement.setAttribute('data-theme', 'light');
              } else {
                document.documentElement.setAttribute('data-theme', 'dark');
              }
            } catch (e) {}
          })();
        `}} />
      </head>
      <body className={inter.className}>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <main style={{ flex: 1, marginLeft: 240, minHeight: '100vh', background: 'var(--bg-primary)' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
