import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Sign In',
    template: '%s | Polaris Pilot',
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg bg-mesh flex">
      {/* Left decorative column */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />

        {/* Animated background orbs */}
        <div className="absolute top-20 left-16 w-64 h-64 bg-primary/8 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-32 right-20 w-80 h-80 bg-secondary/8 rounded-full blur-3xl animate-float [animation-delay:1.5s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-button-primary">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white font-heading tracking-tight">
              Polaris<span className="text-primary">Pilot</span>
            </span>
          </div>

          {/* Feature list */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white font-heading leading-tight mb-3">
                The all-in-one<br />
                <span className="gradient-text">Roblox admin suite.</span>
              </h2>
              <p className="text-slate-400 text-base leading-relaxed max-w-sm">
                Build application forms, manage rank centers, and automate promotions — all powered by AI.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: '📋', title: 'Application Builder', desc: 'Create custom Q&A forms for your Roblox group with AI assistance' },
                { icon: '⭐', title: 'Rank Center', desc: 'Manage and sell ranks with Gamepass integration and regional pricing' },
                { icon: '🤖', title: 'AI-Powered Grading', desc: 'Automatically grade short answers and promote passing applicants' },
                { icon: '🔑', title: 'Secure API Keys', desc: 'Encrypted storage with fine-grained permission scopes' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl glass hover:bg-white/5 transition-all"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="text-xl">{item.icon}</div>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[12px] text-slate-700">
            © 2026 Polaris Pilot. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right auth panel */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[420px] animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-gradient-primary rounded-xl flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white font-heading">
              Polaris<span className="text-primary">Pilot</span>
            </span>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
