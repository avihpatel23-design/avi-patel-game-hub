'use client';

import { useEffect, useState } from 'react';
import GameShell from '@/app/components/GameShell';

export default function ReactionPage() {
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState('Press start and wait for the signal.');
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (!ready || !startTime) return;
    const timer = window.setInterval(() => setTime(Date.now() - startTime), 10);
    return () => window.clearInterval(timer);
  }, [ready, startTime]);

  const startGame = () => {
    setReady(true);
    setMessage('Wait for green...');
    setStartTime(null);
    setTime(0);
    const delay = 800 + Math.random() * 1800;
    window.setTimeout(() => {
      setReady(false);
      setMessage('Click now!');
      setStartTime(Date.now());
    }, delay);
  };

  const handleClick = () => {
    if (!startTime) {
      if (ready) {
        setMessage('Too soon! Start again.');
        setReady(false);
      }
      return;
    }

    const reactionTime = Date.now() - startTime;
    setScore((prev) => prev + 1);
    setMessage(`Reaction ${reactionTime}ms`);
    setReady(false);
    setStartTime(null);
    setTime(0);
  };

  return (
    <GameShell
      title="Reaction Speed"
      description="Train your reflexes by clicking at the perfect instant when the panel flips green."
      accentClass="from-violet-400 to-fuchsia-500"
      onRestart={startGame}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <button
          onClick={handleClick}
          className={`flex h-[320px] items-center justify-center rounded-[24px] border px-6 text-center text-2xl font-semibold transition sm:w-full lg:w-[60%] ${
            startTime
              ? 'border-emerald-400/40 bg-emerald-500/20 text-emerald-100'
              : 'border-white/10 bg-slate-950/70 text-slate-200 hover:border-cyan-400/30'
          }`}
        >
          {startTime ? 'NOW!' : message}
        </button>

        <div className="flex flex-1 flex-col gap-4 rounded-[24px] border border-white/10 bg-slate-950/70 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-3">
              <p className="text-sm text-cyan-100">Score</p>
              <p className="text-2xl font-semibold text-white">{score}</p>
            </div>
            <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-3">
              <p className="text-sm text-violet-100">Latency</p>
              <p className="text-2xl font-semibold text-white">{time ? `${time}ms` : '—'}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            Start a round, wait for green, then click as fast as you can.
          </div>
        </div>
      </div>
    </GameShell>
  );
}
