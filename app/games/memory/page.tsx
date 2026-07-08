'use client';

import { useEffect, useMemo, useState } from 'react';
import GameShell from '@/app/components/GameShell';

type Difficulty = 'easy' | 'medium' | 'hard';

type Card = {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
};

const emojiSet = ['⚡', '🎯', '🌟', '🪐', '💎', '🕹️', '🧠', '🚀'];
const difficultyConfig = {
  easy: 4,
  medium: 6,
  hard: 8,
};

function shuffleCards(pairCount: number) {
  const deck = emojiSet.slice(0, pairCount)
    .flatMap((emoji) => [emoji, emoji])
    .map((emoji, index) => ({ id: index, emoji, flipped: false, matched: false }))
    .sort(() => Math.random() - 0.5);
  return deck;
}

export default function MemoryPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [cards, setCards] = useState<Card[]>(() => shuffleCards(difficultyConfig.medium));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [pairsFound, setPairsFound] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [message, setMessage] = useState('Find every pair.');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  const pairCount = difficultyConfig[difficulty];
  const completed = useMemo(() => pairsFound === pairCount, [pairsFound, pairCount]);

  useEffect(() => {
    if (completed) {
      setMessage('Board cleared — premium memory mode unlocked.');
      setShowConfetti(true);
      return;
    }

    const interval = window.setInterval(() => setTimer((prev) => prev + 1), 1000);
    return () => window.clearInterval(interval);
  }, [completed]);

  const resetGame = () => {
    setCards(shuffleCards(pairCount));
    setFlipped([]);
    setMoves(0);
    setPairsFound(0);
    setScore(0);
    setTimer(0);
    setMessage('Find every pair.');
    setShowConfetti(false);
  };

  useEffect(() => {
    if (!completed) {
      resetGame();
    }
  }, [difficulty]);

  const handleFlip = (index: number) => {
    if (flipped.length === 2 || cards[index].flipped || cards[index].matched) return;

    const nextCards = cards.map((card, cardIndex) => (cardIndex === index ? { ...card, flipped: true } : card));
    const nextFlipped = [...flipped, index];
    setCards(nextCards);
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      const [firstIndex, secondIndex] = nextFlipped;
      if (nextCards[firstIndex].emoji === nextCards[secondIndex].emoji) {
        const bonus = timer < 8 ? 120 : 80;
        setTimeout(() => {
          setCards((current) => current.map((card, cardIndex) => (cardIndex === firstIndex || cardIndex === secondIndex ? { ...card, matched: true, flipped: false } : card)));
          setPairsFound((prev) => prev + 1);
          setScore((prev) => prev + 240 + bonus);
          setMessage('Perfect match! Combo bonus earned.');
        }, 300);
        setFlipped([]);
      } else {
        setTimeout(() => {
          setCards((current) => current.map((card, cardIndex) => (cardIndex === firstIndex || cardIndex === secondIndex ? { ...card, flipped: false } : card)));
          setMessage('Try again — focus and reset.');
          setScore((prev) => Math.max(0, prev - 25));
        }, 700);
        setFlipped([]);
      }
    }
  };

  useEffect(() => {
    if (completed) {
      setMessage('Board cleared — premium memory mode unlocked.');
    }
  }, [completed]);

  return (
    <GameShell
      title="Memory Match"
      description="Flip cards, memorize every icon, and clear the board with precision."
      accentClass="from-fuchsia-500 to-cyan-500"
      onRestart={resetGame}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_45%),linear-gradient(135deg,rgba(88,28,135,0.28),rgba(2,6,23,0.95))] p-4 shadow-[0_0_40px_rgba(34,211,238,0.08)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold capitalize transition ${
                  difficulty === level
                    ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/30 hover:bg-white/10'
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/30 hover:text-cyan-100"
          >
            {soundEnabled ? '🔊 Sound on' : '🔈 Sound off'}
          </button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[30px] border border-white/10 bg-slate-950/75 p-3 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">Pairs found</p>
                <p className="mt-1 text-lg font-semibold text-white">{pairsFound}/{pairCount}</p>
              </div>
              <div className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-100">
                {completed ? 'Cleared' : `${pairCount - pairsFound} left`}
              </div>
            </div>

            <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-violet-500 transition-all duration-500"
                style={{ width: `${(pairsFound / pairCount) * 100}%` }}
              />
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {cards.map((card, index) => (
                <button
                  key={card.id}
                  onClick={() => handleFlip(index)}
                  disabled={card.flipped || card.matched}
                  className="group relative aspect-square rounded-[20px] border border-white/10 bg-slate-900/80 shadow-inner shadow-black/20 transition duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:border-cyan-400/40"
                >
                  <div className={`absolute inset-0 rounded-[20px] bg-gradient-to-br from-fuchsia-500/80 via-violet-600/80 to-cyan-500/80 transition-all duration-500 ${card.flipped || card.matched ? 'opacity-0' : 'opacity-100'}`} />
                  <div className={`absolute inset-0 flex items-center justify-center rounded-[20px] bg-slate-950/80 text-3xl shadow-[inset_0_0_20px_rgba(34,211,238,0.2)] transition-all duration-500 ${card.flipped || card.matched ? 'opacity-100' : 'opacity-0'}`}>
                    <span className="text-2xl text-cyan-200 drop-shadow-[0_0_18px_rgba(34,211,238,0.4)] sm:text-3xl">
                      {card.emoji}
                    </span>
                  </div>
                  {!card.flipped && !card.matched ? (
                    <span className="absolute inset-0 flex items-center justify-center text-xl font-black text-white/80 transition group-hover:scale-110">
                      ?
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-[30px] border border-white/10 bg-slate-950/75 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-3">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-100">Moves</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{moves}</p>
                </div>
                <div className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 p-3">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-fuchsia-100">Score</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{score}</p>
                </div>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-3">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-amber-100">Timer</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{timer}s</p>
                </div>
                <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-3">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-violet-100">Bonus</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{timer < 8 ? 'Fast' : 'Steady'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-slate-950/75 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">{message}</div>
              <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-400">
                <p>• Match icons in the fewest moves possible.</p>
                <p>• Faster clears earn bigger combo bonuses.</p>
                <p>• Hard mode adds more pairs and a tougher memory sprint.</p>
              </div>
            </div>

            {showConfetti ? (
              <div className="rounded-[30px] border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-100">
                ✨ Victory burst! You cleared the board in style.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </GameShell>
  );
}
