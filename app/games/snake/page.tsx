'use client';

import { useEffect, useMemo, useState } from 'react';
import GameShell from '@/app/components/GameShell';

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type SpeedLevel = 'easy' | 'medium' | 'hard';

type GameState = 'start' | 'playing' | 'paused' | 'over';

const GRID_SIZE = 18;
const INITIAL_SNAKE: Point[] = [
  { x: 8, y: 8 },
  { x: 7, y: 8 },
  { x: 6, y: 8 },
];

const speedMap: Record<SpeedLevel, number> = {
  easy: 150,
  medium: 115,
  hard: 85,
};

function randomFood(snake: Point[]) {
  let nextFood: Point;
  do {
    nextFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some((segment) => segment.x === nextFood.x && segment.y === nextFood.y));
  return nextFood;
}

export default function SnakePage() {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>(() => randomFood(INITIAL_SNAKE));
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [queuedDirection, setQueuedDirection] = useState<Direction>('RIGHT');
  const [gameState, setGameState] = useState<GameState>('start');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [speed, setSpeed] = useState<SpeedLevel>('medium');
  const [flash, setFlash] = useState(false);
  const [shake, setShake] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const board = useMemo(
    () =>
      Array.from({ length: GRID_SIZE }, (_, y) =>
        Array.from({ length: GRID_SIZE }, (_, x) => {
          if (snake.some((segment) => segment.x === x && segment.y === y)) return 'snake';
          if (food.x === x && food.y === y) return 'food';
          return 'empty';
        })
      ),
    [snake, food]
  );

  useEffect(() => {
    const stored = window.localStorage.getItem('snake-high-score');
    if (stored) {
      setHighScore(Number(stored));
    }
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = window.setInterval(() => {
      setSnake((currentSnake) => {
        const head = currentSnake[0];
        const nextHead = { ...head };
        const nextDir = queuedDirection;

        if (nextDir === 'UP') nextHead.y -= 1;
        if (nextDir === 'DOWN') nextHead.y += 1;
        if (nextDir === 'LEFT') nextHead.x -= 1;
        if (nextDir === 'RIGHT') nextHead.x += 1;

        const hitWall = nextHead.x < 0 || nextHead.x >= GRID_SIZE || nextHead.y < 0 || nextHead.y >= GRID_SIZE;
        const hitBody = currentSnake.some((segment) => segment.x === nextHead.x && segment.y === nextHead.y);

        if (hitWall || hitBody) {
          setGameState('over');
          setShake(true);
          setTimeout(() => setShake(false), 260);
          const nextHigh = Math.max(score, highScore);
          setHighScore(nextHigh);
          window.localStorage.setItem('snake-high-score', String(nextHigh));
          return currentSnake;
        }

        const ateFood = nextHead.x === food.x && nextHead.y === food.y;
        const nextSnake = [nextHead, ...currentSnake];
        const trimmedSnake = ateFood ? nextSnake : nextSnake.slice(0, -1);

        if (ateFood) {
          const newScore = score + 10;
          setScore(newScore);
          setFlash(true);
          setTimeout(() => setFlash(false), 220);
          setLevel(Math.floor(newScore / 50) + 1);
          setFood(randomFood(trimmedSnake));
          if (newScore > highScore) {
            setHighScore(newScore);
            window.localStorage.setItem('snake-high-score', String(newScore));
          }
        }

        setDirection(nextDir);
        return trimmedSnake;
      });
    }, speedMap[speed]);

    return () => window.clearInterval(timer);
  }, [gameState, queuedDirection, food, score, highScore, speed]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameState === 'start' && event.key === 'Enter') {
        startGame();
        return;
      }

      const nextDirection = {
        ArrowUp: 'UP' as const,
        ArrowDown: 'DOWN' as const,
        ArrowLeft: 'LEFT' as const,
        ArrowRight: 'RIGHT' as const,
      }[event.key];

      if (!nextDirection) return;

      setQueuedDirection((current) => {
        if (
          (current === 'UP' && nextDirection === 'DOWN') ||
          (current === 'DOWN' && nextDirection === 'UP') ||
          (current === 'LEFT' && nextDirection === 'RIGHT') ||
          (current === 'RIGHT' && nextDirection === 'LEFT')
        ) {
          return current;
        }
        return nextDirection;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, queuedDirection]);

  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(randomFood(INITIAL_SNAKE));
    setDirection('RIGHT');
    setQueuedDirection('RIGHT');
    setScore(0);
    setLevel(1);
    setGameState('playing');
    setFlash(false);
    setShake(false);
  };

  const pauseGame = () => {
    if (gameState === 'playing') setGameState('paused');
    if (gameState === 'paused') setGameState('playing');
  };

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(randomFood(INITIAL_SNAKE));
    setDirection('RIGHT');
    setQueuedDirection('RIGHT');
    setGameState('start');
    setScore(0);
    setLevel(1);
    setFlash(false);
    setShake(false);
  };

  const applyDirection = (nextDirection: Direction) => {
    if (gameState !== 'playing') return;
    setQueuedDirection((current) => {
      if (
        (current === 'UP' && nextDirection === 'DOWN') ||
        (current === 'DOWN' && nextDirection === 'UP') ||
        (current === 'LEFT' && nextDirection === 'RIGHT') ||
        (current === 'RIGHT' && nextDirection === 'LEFT')
      ) {
        return current;
      }
      return nextDirection;
    });
  };

  return (
    <GameShell
      title="Snake"
      description="Guide the serpent through a glowing neon arena, feast on radiant fruit, and chase a fresh high score."
      accentClass="from-emerald-400 to-cyan-400"
      onRestart={resetGame}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap gap-2 rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_45%),linear-gradient(135deg,rgba(13,148,136,0.2),rgba(2,6,23,0.95))] p-4 shadow-[0_0_40px_rgba(34,211,238,0.08)]">
          {(['easy', 'medium', 'hard'] as SpeedLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => setSpeed(level)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold capitalize transition ${
                speed === level
                  ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/30 hover:bg-white/10'
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[32px] border border-cyan-400/20 bg-slate-950/80 p-3 shadow-[0_0_50px_rgba(34,211,238,0.12)] backdrop-blur-xl sm:p-4">
            <div className={`relative mx-auto aspect-square w-full max-w-[560px] overflow-hidden rounded-[28px] border border-cyan-400/20 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_45%),linear-gradient(145deg,_#07111f,_#030712)] p-2 shadow-[inset_0_0_40px_rgba(34,211,238,0.12)] ${shake ? 'animate-pulse' : ''}`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.04)_1px,_transparent_1px)] bg-[size:24px_24px]" />
              <div className="absolute inset-3 rounded-[24px] border border-white/10" />
              <div className="grid h-full w-full gap-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}>
                {board.flat().map((cell, index) => {
                  const x = index % GRID_SIZE;
                  const y = Math.floor(index / GRID_SIZE);
                  const isSnake = snake.some((segment) => segment.x === x && segment.y === y);
                  const isFood = food.x === x && food.y === y;
                  const isHead = snake[0].x === x && snake[0].y === y;

                  return (
                    <div
                      key={`${x}-${y}`}
                      className={`relative rounded-[10px] border border-white/5 shadow-[inset_0_1px_3px_rgba(255,255,255,0.12)] transition-all duration-150 ${
                        isFood
                          ? 'bg-gradient-to-br from-rose-400 to-orange-500 shadow-[0_0_18px_rgba(248,113,113,0.45)]'
                          : isSnake
                            ? isHead
                              ? 'bg-gradient-to-br from-emerald-300 to-cyan-400 shadow-[0_0_22px_rgba(74,222,128,0.55)]'
                              : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-[0_0_18px_rgba(16,185,129,0.35)]'
                            : 'bg-slate-900/70'
                      } ${flash && isFood ? 'scale-110' : ''}`}
                    >
                      {isHead ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-slate-950" />
                          <div className="ml-1 h-2 w-2 rounded-full bg-slate-950" />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            {gameState === 'start' ? (
              <div className="mt-4 rounded-[24px] border border-cyan-400/20 bg-cyan-500/10 p-4 text-center text-slate-100">
                <p className="text-lg font-semibold">Ready to slither?</p>
                <p className="mt-1 text-sm text-slate-300">Tap play and chase a fresh high score.</p>
                <button
                  onClick={startGame}
                  className="mt-3 rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_0_25px_rgba(34,211,238,0.25)]"
                >
                  Play
                </button>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-[30px] border border-white/10 bg-slate-950/75 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-3">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-100">Score</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{score}</p>
                </div>
                <div className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 p-3">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-fuchsia-100">High score</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{highScore}</p>
                </div>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-3">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-amber-100">Level</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{level}</p>
                </div>
                <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-3">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-violet-100">Status</p>
                  <p className="mt-1 text-xl font-semibold text-white">{gameState === 'playing' ? 'Live' : gameState === 'paused' ? 'Paused' : gameState === 'over' ? 'Game over' : 'Ready'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-slate-950/75 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="flex flex-wrap gap-2">
                <button onClick={pauseGame} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-400/30 hover:bg-white/10">
                  {gameState === 'paused' ? 'Resume' : 'Pause'}
                </button>
                <button onClick={startGame} className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20">
                  Restart
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { key: 'UP', label: '▲' },
                  { key: 'LEFT', label: '◀' },
                  { key: 'DOWN', label: '▼' },
                  { key: 'RIGHT', label: '▶' },
                ].map((button) => (
                  <button
                    key={button.key}
                    onClick={() => applyDirection(button.key as Direction)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-lg font-semibold text-slate-100 transition hover:border-cyan-400/30 hover:bg-white/10"
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-slate-950/75 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <button
                onClick={() => setSoundEnabled((prev) => !prev)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-400/30 hover:bg-white/10"
              >
                {soundEnabled ? '🔊 Sound on' : '🔈 Sound off'}
              </button>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                Use the arrow keys or the touch buttons to steer. Eat the glowing orb to grow and score.
              </p>
            </div>
          </div>
        </div>
      </div>
    </GameShell>
  );
}
