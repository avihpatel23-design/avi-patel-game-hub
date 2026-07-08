'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

type GameShellProps = {
  title: string;
  description: string;
  accentClass: string;
  children: ReactNode;
  onRestart?: () => void;
};

export default function GameShell({ title, description, accentClass, children, onRestart }: GameShellProps) {
  return (
    <main className="min-h-screen bg-[#04070f] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className={`inline-flex rounded-full bg-gradient-to-r ${accentClass} px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-950`}>
                Avi Patel Game Hub
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">{description}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {onRestart ? (
                <button
                  onClick={onRestart}
                  className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
                >
                  Restart
                </button>
              ) : null}
              <Link
                href="/"
                className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-400/30 hover:bg-white/15"
              >
                ← Back home
              </Link>
            </div>
          </div>
        </header>

        <section className="rounded-[32px] border border-white/10 bg-slate-900/70 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
          {children}
        </section>
      </div>
    </main>
  );
}
