import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Avi Patel Game Hub',
  description: 'A premium 9-in-1 mini game app with local browser games and a polished dark UI.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
