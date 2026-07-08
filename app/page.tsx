'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

const games = [
  { title: 'Snake Game', href: '/games/snake', icon: 'snake.png', description: 'Guide a neon serpent through a glowing grid.' },
  { title: 'Tic Tac Toe', href: '/games/tic-tac-toe', icon: 'tictactoe.png', description: 'Take the center and claim three-in-a-row.' },
  { title: 'Memory Match', href: '/games/memory', icon: 'memory.png', description: 'Flip cards and clear the board.' },
  { title: 'Paddle Battle', href: '/games/galaxy-shooter', icon: 'paddle.png', description: 'Fast paddle battle game.' },
  { title: 'Number Guess', href: '/games/number-guess', icon: 'number.png', description: 'Crack the hidden number.' },
  { title: 'Chess Game', href: '/games/chess', icon: 'chess.png', description: 'Classic chess with timer.' },
  { title: 'Rock Paper Scissors', href: '/games/rock-paper-scissors', icon: 'rps.png', description: 'Outsmart the bot.' },
];

export default function HomePage() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  async function askCoach() {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer('');

    const res = await fetch('/api/game-coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });

    const data = await res.json();
    setAnswer(data.result || data.error || 'No answer');
    setLoading(false);
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="rounded-[36px] border border-white/10 bg-slate-900/80 p-7 shadow-2xl shadow-cyan-950/40 sm:p-10 lg:p-14">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Premium mini game portal</p>

          <div className="mt-5 mb-6">
            <Image src="/icons/logo.png.png" alt="Avi Patel Logo" width={90} height={90} className="rounded-2xl shadow-2xl" />
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Avi Patel Game Hub
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-slate-300">
            A polished 7-in-1 arcade collection built in Next.js with fast browser games and Mesh AI Game Coach.
          </p>

          <div className="mt-6 inline-block rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
            7 games · Mesh AI Coach · Mobile ready
          </div>
        </section>

        <section className="rounded-[28px] border border-purple-400/20 bg-slate-900/80 p-6 shadow-xl shadow-purple-950/30">
          <h2 className="text-2xl font-bold text-white">🎮 Mesh AI Game Coach</h2>
          <p className="mt-2 text-slate-400">Ask for tips about Snake, Chess, Tic Tac Toe, Memory, Paddle, Number Guess, or RPS.</p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Example: How can I win Snake Game?"
              className="flex-1 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none"
            />
            <button
              onClick={askCoach}
              disabled={loading}
              className="rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500 px-6 py-3 font-semibold text-white disabled:opacity-60"
            >
              {loading ? 'Thinking...' : 'Ask Mesh AI'}
            </button>
          </div>

          {answer && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4 text-slate-200">
              {answer}
            </div>
          )}
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {games.map((game) => (
            <Link key={game.title} href={game.href} className="group rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:border-cyan-400/40">
              <Image src={`/icons/${game.icon}`} alt={game.title} width={64} height={64} className="h-16 w-16 rounded-xl object-contain" />
              <h2 className="mt-3 text-xl font-semibold text-white">{game.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">{game.description}</p>
              <div className="mt-6 text-sm font-medium text-cyan-300">Play now →</div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}