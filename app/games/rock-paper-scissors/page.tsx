'use client';

import { useMemo, useState } from 'react';
import GameShell from '@/app/components/GameShell';

type Choice = 'rock' | 'paper' | 'scissors';
type Result = 'win' | 'lose' | 'draw';
type MatchMode = 'best3' | 'best5' | 'endless';

const moves: Choice[] = ['rock', 'paper', 'scissors'];
const labels: Record<Choice, string> = {
  rock: '🪨 Rock',
  paper: '📄 Paper',
  scissors: '✂️ Scissors',
};
const icons: Record<Choice, string> = {
  rock: '🪨',
  paper: '📄',
  scissors: '✂️',
};

function getResult(player: Choice, computer: Choice): Result {
  if (player === computer) return 'draw';
  if (
    (player === 'rock' && computer === 'scissors') ||
    (player === 'paper' && computer === 'rock') ||
    (player === 'scissors' && computer === 'paper')
  ) {
    return 'win';
  }
  return 'lose';
}

export default function RockPaperScissorsPage() {
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [score, setScore] = useState({ wins: 0, losses: 0, draws: 0, streak: 0 });
  const [mode, setMode] = useState<MatchMode>('best3');
  const [round, setRound] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [battleState, setBattleState] = useState<'idle' | 'revealing'>('idle');

  const resetGame = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
    setBattleState('idle');
    setRound(1);
  };

  const play = (choice: Choice) => {
    if (battleState === 'revealing') return;
    setBattleState('revealing');
    const randomChoice = moves[Math.floor(Math.random() * moves.length)];
    const nextResult = getResult(choice, randomChoice);

    window.setTimeout(() => {
      setPlayerChoice(choice);
      setComputerChoice(randomChoice);
      setResult(nextResult);
      setBattleState('idle');
      setRound((prev) => prev + 1);
      setScore((prev) => {
        const next = { ...prev };
        if (nextResult === 'win') {
          next.wins += 1;
          next.streak += 1;
        } else if (nextResult === 'lose') {
          next.losses += 1;
          next.streak = 0;
        } else {
          next.draws += 1;
          next.streak = 0;
        }
        return next;
      });
    }, 650);
  };

  const resultText = useMemo(() => {
    if (!result) return 'Choose your move.';
    if (result === 'win') return 'Victory!';
    if (result === 'lose') return 'The machine wins.';
    return 'Balanced draw.';
  }, [result]);

  const totalRounds = mode === 'best3' ? 3 : mode === 'best5' ? 5 : 999;
  const roundLabel = mode === 'endless' ? '∞' : `${Math.min(round, totalRounds)}/${totalRounds}`;

  return (
    <GameShell
      title="Rock Paper Scissors"
      description="Face the machine in a stylish duel of timing and prediction."
      accentClass="from-amber-400 to-rose-500"
      onRestart={resetGame}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap gap-2 rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.16),_transparent_45%),linear-gradient(135deg,rgba(192,38,211,0.22),rgba(2,6,23,0.95))] p-4 shadow-[0_0_40px_rgba(236,72,153,0.08)]">
          {(['best3', 'best5', 'endless'] as MatchMode[]).map((value) => (
            <button
              key={value}
              onClick={() => {
                setMode(value);
                resetGame();
              }}
              className={`rounded-full border px-4 py-2 text-sm font-semibold capitalize transition ${
                mode === value
                  ? 'border-amber-400/50 bg-amber-500/15 text-amber-100 shadow-[0_0_20px_rgba(251,191,36,0.2)]'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:border-amber-400/30 hover:bg-white/10'
              }`}
            >
              {value === 'best3' ? 'Best of 3' : value === 'best5' ? 'Best of 5' : 'Endless'}
            </button>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[32px] border border-white/10 bg-slate-950/75 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
              <div className={`rounded-[24px] border border-cyan-400/20 bg-cyan-500/10 p-4 text-center transition ${result === 'win' ? 'ring-2 ring-emerald-400/50' : result === 'lose' ? 'animate-[shake_0.3s_ease-in-out]' : ''}`}>
                <p className="text-[11px] uppercase tracking-[0.35em] text-cyan-100">You</p>
                <div className="mt-4 flex min-h-[120px] items-center justify-center rounded-[20px] border border-white/10 bg-slate-900/70 text-6xl shadow-[inset_0_0_25px_rgba(34,211,238,0.15)]">
                  {playerChoice ? icons[playerChoice] : '⚡'}
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 rounded-[24px] border border-white/10 bg-white/5 px-4 py-5 text-center">
                <div className="rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                  VS
                </div>
                <p className="text-sm text-slate-400">Round {roundLabel}</p>
                <p className={`text-lg font-semibold ${result === 'win' ? 'text-emerald-300' : result === 'lose' ? 'text-rose-300' : result === 'draw' ? 'text-amber-300' : 'text-slate-200'}`}>
                  {resultText}
                </p>
              </div>

              <div className={`rounded-[24px] border border-fuchsia-400/20 bg-fuchsia-500/10 p-4 text-center transition ${result === 'lose' ? 'ring-2 ring-rose-400/50' : result === 'draw' ? 'animate-pulse' : ''}`}>
                <p className="text-[11px] uppercase tracking-[0.35em] text-fuchsia-100">Bot</p>
                <div className="mt-4 flex min-h-[120px] items-center justify-center rounded-[20px] border border-white/10 bg-slate-900/70 text-6xl shadow-[inset_0_0_25px_rgba(217,70,239,0.15)]">
                  {computerChoice ? icons[computerChoice] : '🤖'}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {moves.map((move) => (
                <button
                  key={move}
                  onClick={() => play(move)}
                  className="group rounded-[22px] border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/90 px-4 py-5 text-lg font-semibold text-white shadow-[0_0_20px_rgba(255,255,255,0.04)] transition duration-200 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-[0_0_24px_rgba(34,211,238,0.18)]"
                >
                  <span className="mb-2 block text-4xl transition group-hover:scale-110">{icons[move]}</span>
                  <span>{labels[move]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-[30px] border border-white/10 bg-slate-950/75 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-center">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-emerald-100">Wins</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{score.wins}</p>
                </div>
                <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-center">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-rose-100">Losses</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{score.losses}</p>
                </div>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-3 text-center">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-amber-100">Draws</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{score.draws}</p>
                </div>
                <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-3 text-center">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-violet-100">Streak</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{score.streak}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-slate-950/75 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="flex flex-wrap gap-2">
                <button onClick={resetGame} className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20">
                  Restart
                </button>
                <button onClick={() => setSoundEnabled((prev) => !prev)} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-400/30 hover:bg-white/10">
                  {soundEnabled ? '🔊 Sound on' : '🔈 Sound off'}
                </button>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-400">
                Pick a move, let the bot reveal its choice, and chase the best streak in this neon showdown.
              </p>
            </div>
          </div>
        </div>
      </div>
    </GameShell>
  );
}
