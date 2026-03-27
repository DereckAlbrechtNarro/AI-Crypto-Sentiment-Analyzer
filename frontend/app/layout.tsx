// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CryptoPulse AI - Live Sentiment Analyzer',
  description: 'Real-time Crypto Prices + AI News Sentiment Analysis',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-white min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}