import type { Metadata } from 'next';
import { Fraunces, Space_Mono } from 'next/font/google';
import '../styles/globals.css';
import { Providers } from './providers';
import { ToasterProvider } from '@/components/ToasterProvider';

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
  axes: ['opsz', 'SOFT', 'WONK'],
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '700'],
  variable: '--font-space-mono',
});

export const metadata: Metadata = {
  title: 'pinguin boat — moderation, music, economy, tickets',
  description:
    'a discord bot and a dashboard. moderation, music, economy, levels, tickets, giveaways. one integration, configured from the web.',
  icons: {
    icon: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${spaceMono.variable}`}
      data-theme="halftone"
      suppressHydrationWarning
    >
      <body>
        <a className="skip-link" href="#main">
          skip to content
        </a>
        <Providers>
          {children}
          <ToasterProvider />
        </Providers>
      </body>
    </html>
  );
}