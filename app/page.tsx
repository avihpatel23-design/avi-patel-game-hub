'use client';

import Link from 'next/link';
import Image from 'next/image';
const games = [
  {
    title: 'Snake Game',
    href: '/games/snake',
    icon: 'snake.png',
    description: 'Guide a neon serpent through a glowing grid.',
    accent: 'from-emerald-400 to-cyan-400'
  },
  {
    title: 'Tic Tac Toe',
    href: '/games/tic-tac-toe',
    icon: 'tictactoe.png',
    description: 'Take the center and claim three-in-a-row.',
    accent: 'from-fuchsia-500 to-violet-500'
  },
  {
    title: 'Memory Match',
    href: '/games/memory',
    icon: 'memory.png',
    description: 'Flip cards and clear the board.',
    accent: 'from-amber-400 to-orange-500'
  },
  {
    title: 'Paddle Battle',
    href: '/games/galaxy-shooter',
    icon: 'paddle.png',
    description: 'Fast paddle battle game.',
    accent: 'from-cyan-500 to-fuchsia-600'
  },
  {
    title: 'Number Guess',
    href: '/games/number-guess',
    icon: 'number.png',
    description: 'Crack the hidden number.',
    accent: 'from-emerald-400 to-lime-500'
  },
  {
    title: 'Chess Game',
    href: '/games/chess',
    icon: 'chess.png',
    description: 'Classic chess with timer.',
    accent: 'from-amber-500 to-yellow-700'
  },
  {
    title: 'Rock Paper Scissors',
    href: '/games/rock-paper-scissors',
    icon: 'rps.png',
    description: 'Outsmart the bot.',
    accent: 'from-amber-400 to-rose-500'
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="overflow-hidden rounded-[36px] border border-white/10 bg-slate-900/80 p-7 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl sm:p-10 lg:p-14">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Premium mini game portal</p>
              <div className="mb-6">
  <Image
    src="/icons/logo.png.png"
    alt="Avi Patel Logo"
    width={90}
    height={90}
    className="rounded-2xl shadow-2xl"
  />
</div>
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Avi Patel Game Hub
              </h1>
              <p className="max-w-2xl text-lg text-slate-300">
                A polished 7-in-1 arcade collection built in Next.js with fast browser games, bold visuals, and no external APIs.
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
              7 games · Fully local · Mobile ready
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {games.map((game) => (
            <Link
              key={game.title}
              href={game.href}
              className="group rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-black/30 backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-slate-900/90"
            >
              <Image
  src={`/icons/${game.icon}`}
  alt={game.title}
  width={64}
  height={64}
  className="h-16 w-16 rounded-xl object-contain"
/>
              <h2 className="text-xl font-semibold text-white">{game.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">{game.description}</p>
              <div className="mt-6 text-sm font-medium text-cyan-300 transition group-hover:text-cyan-200">
                Play now →
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
