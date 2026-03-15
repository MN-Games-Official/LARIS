import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: {
    default: 'Polaris Pilot — Admin Portal',
    template: '%s | Polaris Pilot',
  },
  description:
    'Polaris Pilot admin portal — manage Roblox group applications, rank centers, and API integrations.',
  keywords: ['Roblox', 'group management', 'application center', 'rank center', 'admin portal'],
  robots: { index: false, follow: false }, // Admin portal — no indexing
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
