'use client';

import { useEffect, useMemo, useState } from 'react';
import GameShell from '@/app/components/GameShell';

type Player = 'X' | 'O';
type Mode = 'pvp' | 'bot';

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkWinner(board: Array<Player | null>) {
  for (const [a, b, c] of winningLines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as Player, line: [a, b, c] };
    }
  }
  return { winner: null as Player | null, line: null as number[] | null };
}

function getBotMove(board: Array<Player | null>) {
  const availableMoves = board
    .map((cell, index) => (cell === null ? index : null))
    .filter((index): index is number => index !== null);

  for (const move of availableMoves) {
    const trialBoard = [...board];
    trialBoard[move] = 'O';
    if (checkWinner(trialBoard).winner === 'O') {
      return move;
    }
  }

  for (const move of availableMoves) {
    const trialBoard = [...board];
    trialBoard[move] = 'X';
    if (checkWinner(trialBoard).winner === 'X') {
      return move;
    }
  }

  const preferredMoves = [4, 0, 2, 6, 8, 1, 3, 5, 7];
  const firstPreferred = preferredMoves.find((move) => availableMoves.includes(move));
  if (firstPreferred !== undefined) {
    return firstPreferred;
  }

  return availableMoves[Math.floor(Math.random() * availableMoves.length)] ?? null;
}

export default function TicTacToePage() {
  const [board, setBoard] = useState<Array<Player | null>>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [mode, setMode] = useState<Mode>('pvp');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [score, setScore] = useState({ X: 0, O: 0, draws: 0 });
  const [status, setStatus] = useState('Player X starts');

  const result = useMemo(() => checkWinner(board), [board]);
  const winner = result.winner;
  const winningLine = result.line;
  const isDraw = !winner && board.every(Boolean);
  const activePlayer = xIsNext ? 'X' : 'O';

  useEffect(() => {
    if (winner) {
      setStatus(`${winner} wins this round!`);
      setScore((prev) => ({ ...prev, [winner]: prev[winner] + 1 }));
      return;
    }

    if (isDraw) {
      setStatus('Draw!');
      setScore((prev) => ({ ...prev, draws: prev.draws + 1 }));
      return;
    }

    if (mode === 'bot' && !xIsNext) {
      setStatus('Bot is thinking...');
      return;
    }

    setStatus(xIsNext ? 'Player X turn' : 'Player O turn');
  }, [board, winner, xIsNext, isDraw, mode]);

  useEffect(() => {
    if (mode !== 'bot' || winner || isDraw || xIsNext) {
      return;
    }

    const timer = window.setTimeout(() => {
      const botMove = getBotMove(board);
      if (botMove === null) {
        return;
      }

      const nextBoard = [...board];
      nextBoard[botMove] = 'O';
      setBoard(nextBoard);
      setXIsNext(true);
    }, 450);

    return () => window.clearTimeout(timer);
  }, [board, mode, winner, isDraw, xIsNext]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setStatus('Player X starts');
  };

  const handleCellClick = (index: number) => {
    if (board[index] || winner || isDraw || (mode === 'bot' && !xIsNext)) {
      return;
    }

    const nextBoard = [...board];
    nextBoard[index] = xIsNext ? 'X' : 'O';
    setBoard(nextBoard);
    setXIsNext((prev) => !prev);
  };

  return (
    <GameShell
      title="Tic Tac Toe"
      description="Challenge a friend or a neon-powered bot in a quick-fire duel of tactics and timing."
      accentClass="from-fuchsia-500 to-cyan-500"
      onRestart={resetGame}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_45%),linear-gradient(135deg,rgba(88,28,135,0.32),rgba(2,6,23,0.95))] p-4 shadow-[0_0_40px_rgba(34,211,238,0.08)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setMode('pvp')}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                mode === 'pvp'
                  ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/30 hover:bg-white/10'
              }`}
            >
              Player vs Player
            </button>
            <button
              onClick={() => setMode('bot')}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                mode === 'bot'
                  ? 'border-fuchsia-400/50 bg-fuchsia-500/15 text-fuchsia-100 shadow-[0_0_20px_rgba(217,70,239,0.2)]'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:border-fuchsia-400/30 hover:bg-white/10'
              }`}
            >
              Player vs Bot
            </button>
          </div>

          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/30 hover:text-cyan-100"
          >
            {soundEnabled ? '🔊 Sound on' : '🔈 Sound off'}
          </button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.8fr]">
          <div className="rounded-[30px] border border-white/10 bg-slate-950/75 p-3 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-4">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">Current turn</p>
                <div
                  className={`mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition ${
                    activePlayer === 'X'
                      ? 'border-cyan-400/40 bg-cyan-500/10 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.18)]'
                      : 'border-fuchsia-400/40 bg-fuchsia-500/10 text-fuchsia-100 shadow-[0_0_20px_rgba(217,70,239,0.18)]'
                  }`}
                >
                  <span className={`text-2xl font-black ${activePlayer === 'X' ? 'animate-pulse text-cyan-300' : 'animate-pulse text-fuchsia-300'}`}>
                    {activePlayer}
                  </span>
                  <span>{mode === 'bot' && !xIsNext ? 'Bot thinking' : `Player ${activePlayer}`}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Status</p>
                <p className="mt-1 font-semibold text-white">{status}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {board.map((cell, index) => {
                const isWinningCell = winningLine?.includes(index);
                const isDisabled = Boolean(cell) || Boolean(winner) || isDraw || (mode === 'bot' && !xIsNext);

                return (
                  <button
                    key={index}
                    onClick={() => handleCellClick(index)}
                    disabled={isDisabled}
                    className={`group relative aspect-square rounded-[22px] border text-4xl font-black transition duration-200 sm:text-6xl ${
                      cell
                        ? 'border-white/20 bg-slate-900/90'
                        : 'border-white/10 bg-slate-900/70 hover:-translate-y-1 hover:scale-[1.03] hover:border-cyan-400/40'
                    } ${isWinningCell ? 'border-cyan-300/70 shadow-[0_0_30px_rgba(34,211,238,0.25)]' : ''}`}
                  >
                    <span
                      className={`transition duration-200 ${
                        cell === 'X'
                          ? 'text-cyan-300 drop-shadow-[0_0_14px_rgba(34,211,238,0.65)]'
                          : 'text-fuchsia-300 drop-shadow-[0_0_14px_rgba(217,70,239,0.65)]'
                      } ${isWinningCell ? 'scale-110' : 'group-hover:scale-110'}`}
                    >
                      {cell}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-[30px] border border-white/10 bg-slate-950/75 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-3 text-center">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-100">X wins</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{score.X}</p>
                </div>
                <div className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 p-3 text-center">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-fuchsia-100">O wins</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{score.O}</p>
                </div>
                <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-3 text-center">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-amber-100">Draws</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{score.draws}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-slate-950/75 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <h2 className="text-lg font-semibold text-white">Arcade tips</h2>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-400">
                <li>• Control the center early to gain the edge.</li>
                <li>• Block your rival before they finish the line.</li>
                <li>• In bot mode, the easy AI plays fast and smart enough to keep you guessing.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </GameShell>
  );
}
