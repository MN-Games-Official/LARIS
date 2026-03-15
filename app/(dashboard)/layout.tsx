import type { Metadata } from 'next';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth';

export const metadata: Metadata = {
  title: { default: 'Dashboard', template: '%s | Polaris Pilot' },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get user from cookie for the header (server-side)
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  const user = token ? verifyAccessToken(token) : null;

  return (
    <div className="min-h-screen bg-bg bg-mesh flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0" style={{ marginLeft: 'var(--sidebar-width)' }}>
        <Header username={user?.username} email={user?.email} />
        <main className="flex-1 p-4 md:p-6 xl:p-8 max-w-[1400px] w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
