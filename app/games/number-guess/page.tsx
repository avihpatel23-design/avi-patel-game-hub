'use client';

import { useEffect, useState, type FormEvent } from 'react';
import GameShell from '@/app/components/GameShell';

type Difficulty = 'easy' | 'medium' | 'hard';

type DifficultyConfig = {
  label: string;
  max: number;
  penalty: number;
  maxAttempts: number;
  description: string;
};

const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: { label: 'Easy', max: 50, penalty: 8, maxAttempts: 8, description: 'Fast and friendly' },
  medium: { label: 'Medium', max: 100, penalty: 10, maxAttempts: 10, description: 'Balanced challenge' },
  hard: { label: 'Hard', max: 500, penalty: 14, maxAttempts: 12, description: 'Elite precision' },
};

function getRandomTarget(max: number) {
  return Math.floor(Math.random() * max) + 1;
}

function playTone(enabled: boolean, type: 'guess' | 'win' = 'guess') {
  if (!enabled || typeof window === 'undefined') return;
  const AudioContextCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return;

  const audioCtx = new AudioContextCtor();
  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  oscillator.type = type === 'win' ? 'triangle' : 'sine';
  oscillator.frequency.setValueAtTime(type === 'win' ? 780 : 520, audioCtx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(type === 'win' ? 1120 : 640, audioCtx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15);
  oscillator.connect(gain);
  gain.connect(audioCtx.destination);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.15);
}

export default function NumberGuessPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [target, setTarget] = useState(() => getRandomTarget(DIFFICULTIES.medium.max));
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('Pick a number from 1 to 100.');
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(100);
  const [won, setWon] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  const config = DIFFICULTIES[difficulty];
  const progress = Math.min(100, (attempts / config.maxAttempts) * 100);
  const attemptsLeft = Math.max(0, config.maxAttempts - attempts);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('avi-number-guess-high-score');
    if (saved) {
      setHighScore(Number(saved));
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('avi-number-guess-high-score', String(highScore));
  }, [highScore]);

  useEffect(() => {
    if (!showConfetti) return;
    const timer = window.setTimeout(() => setShowConfetti(false), 2200);
    return () => window.clearTimeout(timer);
  }, [showConfetti]);

  const resetGame = (nextDifficulty: Difficulty = difficulty) => {
    const nextConfig = DIFFICULTIES[nextDifficulty];
    setDifficulty(nextDifficulty);
    setTarget(getRandomTarget(nextConfig.max));
    setGuess('');
    setMessage(`New round started: pick a number from 1 to ${nextConfig.max}.`);
    setAttempts(0);
    setScore(100);
    setWon(false);
    setShowConfetti(false);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (won) return;

    const parsed = Number(guess);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > config.max) {
      setMessage(`Enter a whole number from 1 to ${config.max}.`);
      return;
    }

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (parsed === target) {
      setWon(true);
      setShowConfetti(true);
      setMessage(`Correct! ${target} was the target. Premium run unlocked.`);
      playTone(soundEnabled, 'win');
      setHighScore((prev) => Math.max(prev, score));
      return;
    }

    const diff = Math.abs(parsed - target);
    setScore((prev) => Math.max(0, prev - config.penalty));

    if (parsed < target) {
      if (diff <= 3) {
        setMessage('Too low — very close! Keep the pressure on.');
      } else if (diff <= 15) {
        setMessage('Too low — getting warmer.');
      } else {
        setMessage('Too low — far away. Aim higher.');
      }
    } else {
      if (diff <= 3) {
        setMessage('Too high — very close! Stay sharp.');
      } else if (diff <= 15) {
        setMessage('Too high — getting warmer.');
      } else {
        setMessage('Too high — far away. Aim lower.');
      }
    }

    playTone(soundEnabled, 'guess');

    if (nextAttempts >= config.maxAttempts) {
      setWon(true);
      setMessage(`Out of attempts. The mystery number was ${target}.`);
      setShowConfetti(false);
    }
  };

  return (
    <GameShell
      title="Number Guess"
      description="Use logic, style, and a little luck to crack the mystery number in a premium neon challenge."
      accentClass="from-emerald-400 to-lime-500"
      onRestart={() => resetGame(difficulty)}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="w-full rounded-[28px] border border-cyan-400/20 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_35%),linear-gradient(135deg,_rgba(15,23,42,0.95),_rgba(2,6,23,0.95))] p-4 shadow-[0_22px_80px_rgba(0,0,0,0.35)] lg:w-[60%]">
          <div className="mb-4 flex flex-wrap gap-2">
            {(Object.keys(DIFFICULTIES) as Difficulty[]).map((mode) => (
              <button
                key={mode}
                onClick={() => resetGame(mode)}
                className={`rounded-full px-3 py-2 text-sm font-semibold transition ${difficulty === mode ? 'bg-cyan-400 text-slate-950' : 'border border-white/10 bg-white/10 text-slate-200'}`}
              >
                {DIFFICULTIES[mode].label} · 1–{DIFFICULTIES[mode].max}
              </button>
            ))}
          </div>

          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl">
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200">
                Mystery number
              </div>
              <div className="relative mt-5 flex h-32 w-32 items-center justify-center rounded-[32px] border border-cyan-400/30 bg-gradient-to-br from-cyan-500/20 via-slate-900 to-violet-500/20 shadow-[0_0_55px_rgba(34,211,238,0.22)] sm:h-40 sm:w-40">
                <span className="text-6xl font-black text-cyan-100 sm:text-7xl">?</span>
                {showConfetti ? (
                  <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[32px]">
                    {Array.from({ length: 12 }).map((_, index) => (
                      <span
                        key={index}
                        className="absolute top-3 h-2.5 w-2.5 rounded-full"
                        style={{
                          left: `${8 + index * 7}%`,
                          backgroundColor: ['#38bdf8', '#a78bfa', '#f472b6', '#facc15'][index % 4],
                          animation: 'pulse 1.2s infinite',
                          transform: `translateY(${index % 2 === 0 ? 0 : 16}px)`,
                        }}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
              <p className="mt-4 text-sm text-slate-400">{config.description}</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6">
              <label className="text-sm font-medium text-slate-300">Enter your guess</label>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <input
                  type="number"
                  min="1"
                  max={config.max}
                  value={guess}
                  onChange={(event) => setGuess(event.target.value)}
                  disabled={won}
                  className="flex-1 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none ring-0"
                  placeholder={`Guess between 1 and ${config.max}`}
                />
                <button type="submit" disabled={won} className="rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50">
                  Check guess
                </button>
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300">{message}</div>
            </form>
          </div>
        </div>

        <div className="flex w-full flex-1 flex-col gap-4 rounded-[24px] border border-white/10 bg-slate-950/70 p-5 lg:max-w-[35%]">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-3">
              <p className="text-sm text-cyan-100">Score</p>
              <p className="text-2xl font-semibold text-white">{score}</p>
            </div>
            <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-3">
              <p className="text-sm text-violet-100">High score</p>
              <p className="text-2xl font-semibold text-white">{highScore}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
              <span>Attempts</span>
              <span>{attempts}/{config.maxAttempts}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-3 text-sm text-slate-400">{attemptsLeft} tries left in this run.</p>
          </div>

          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-100"
          >
            {soundEnabled ? '🔊 Sound on' : '🔈 Sound off'}
          </button>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-400">
            Every wrong guess chips away at your score. Read the hints, stay calm, and land the perfect number before the attempts run out.
          </div>
        </div>
      </div>
    </GameShell>
  );
}
