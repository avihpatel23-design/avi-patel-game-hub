'use client';

import { useEffect, useMemo, useState } from 'react';
import GameShell from '@/app/components/GameShell';

type Color = 'w' | 'b';
type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
type Piece = {
  type: PieceType;
  color: Color;
};

type Coord = { row: number; col: number };

type GameMode = 'pvp' | 'pve';

const pieceSymbols: Record<Color, Record<PieceType, string>> = {
  w: {
    pawn: '♙',
    rook: '♖',
    knight: '♘',
    bishop: '♗',
    queen: '♕',
    king: '♔',
  },
  b: {
    pawn: '♟',
    rook: '♜',
    knight: '♞',
    bishop: '♝',
    queen: '♛',
    king: '♚',
  },
};

function createInitialBoard(): (Piece | null)[][] {
  const board: (Piece | null)[][] = Array.from({ length: 8 }, () => Array(8).fill(null));

  const blackBackRank: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  const whiteBackRank: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

  blackBackRank.forEach((type, col) => {
    board[0][col] = { type, color: 'b' };
  });
  for (let col = 0; col < 8; col += 1) {
    board[1][col] = { type: 'pawn', color: 'b' };
  }

  whiteBackRank.forEach((type, col) => {
    board[7][col] = { type, color: 'w' };
  });
  for (let col = 0; col < 8; col += 1) {
    board[6][col] = { type: 'pawn', color: 'w' };
  }

  return board;
}

function cloneBoard(board: (Piece | null)[][]): (Piece | null)[][] {
  return board.map((row) => [...row]);
}

function inBounds(row: number, col: number) {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function isEnemy(piece: Piece | null, color: Color) {
  return Boolean(piece && piece.color !== color);
}

function getPieceMoves(board: (Piece | null)[][], row: number, col: number): Coord[] {
  const piece = board[row][col];
  if (!piece) return [];

  const moves: Coord[] = [];
  const { color, type } = piece;
  const direction = color === 'w' ? -1 : 1;

  switch (type) {
    case 'pawn': {
      const oneStep = row + direction;
      if (inBounds(oneStep, col) && !board[oneStep][col]) {
        moves.push({ row: oneStep, col });
        if ((color === 'w' && row === 6) || (color === 'b' && row === 1)) {
          const twoStep = row + direction * 2;
          if (inBounds(twoStep, col) && !board[twoStep][col]) {
            moves.push({ row: twoStep, col });
          }
        }
      }
      for (const offset of [-1, 1]) {
        const nextRow = row + direction;
        const nextCol = col + offset;
        if (inBounds(nextRow, nextCol) && isEnemy(board[nextRow][nextCol], color)) {
          moves.push({ row: nextRow, col: nextCol });
        }
      }
      break;
    }
    case 'rook': {
      for (const [dr, dc] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]) {
        let r = row + dr;
        let c = col + dc;
        while (inBounds(r, c)) {
          const target = board[r][c];
          if (!target) {
            moves.push({ row: r, col: c });
          } else {
            if (target.color !== color) moves.push({ row: r, col: c });
            break;
          }
          r += dr;
          c += dc;
        }
      }
      break;
    }
    case 'bishop': {
      for (const [dr, dc] of [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ]) {
        let r = row + dr;
        let c = col + dc;
        while (inBounds(r, c)) {
          const target = board[r][c];
          if (!target) {
            moves.push({ row: r, col: c });
          } else {
            if (target.color !== color) moves.push({ row: r, col: c });
            break;
          }
          r += dr;
          c += dc;
        }
      }
      break;
    }
    case 'knight': {
      for (const [dr, dc] of [
        [-2, -1],
        [-2, 1],
        [-1, -2],
        [-1, 2],
        [1, -2],
        [1, 2],
        [2, -1],
        [2, 1],
      ]) {
        const r = row + dr;
        const c = col + dc;
        if (inBounds(r, c)) {
          const target = board[r][c];
          if (!target || target.color !== color) {
            moves.push({ row: r, col: c });
          }
        }
      }
      break;
    }
    case 'queen': {
      for (const [dr, dc] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ]) {
        let r = row + dr;
        let c = col + dc;
        while (inBounds(r, c)) {
          const target = board[r][c];
          if (!target) {
            moves.push({ row: r, col: c });
          } else {
            if (target.color !== color) moves.push({ row: r, col: c });
            break;
          }
          r += dr;
          c += dc;
        }
      }
      break;
    }
    case 'king': {
      for (const [dr, dc] of [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
      ]) {
        const r = row + dr;
        const c = col + dc;
        if (inBounds(r, c)) {
          const target = board[r][c];
          if (!target || target.color !== color) {
            moves.push({ row: r, col: c });
          }
        }
      }
      break;
    }
    default:
      break;
  }

  return moves;
}

function playTone(enabled: boolean) {
  if (!enabled) return;
  if (typeof window === 'undefined') return;
  const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return;

  const ctx = new AudioContextCtor();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(540, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(760, ctx.currentTime + 0.12);
  gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.12);
}

export default function ChessPage() {
  const [board, setBoard] = useState<(Piece | null)[][]>(() => createInitialBoard());
  const [selected, setSelected] = useState<Coord | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Color>('w');
  const [message, setMessage] = useState('Choose a white piece to begin.');
  const [gameMode, setGameMode] = useState<GameMode>('pvp');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [timers, setTimers] = useState({ w: 600, b: 600 });
  const [gameOver, setGameOver] = useState(false);

  const legalMoves = useMemo(() => {
    if (!selected) return [];
    const piece = board[selected.row][selected.col];
    if (!piece || piece.color !== currentPlayer) return [];
    return getPieceMoves(board, selected.row, selected.col);
  }, [board, currentPlayer, selected]);

  const restartGame = () => {
    setBoard(createInitialBoard());
    setSelected(null);
    setCurrentPlayer('w');
    setMessage('Fresh board ready. White to move.');
    setTimers({ w: 600, b: 600 });
    setGameOver(false);
  };

  useEffect(() => {
    if (gameOver) return;

    const timer = window.setInterval(() => {
      setTimers((prev) => {
        const next = { ...prev };
        if (currentPlayer === 'w') {
          next.w = Math.max(0, prev.w - 1);
          if (next.w === 0) {
            setGameOver(true);
            setMessage('Black wins by timeout.');
          }
        } else {
          next.b = Math.max(0, prev.b - 1);
          if (next.b === 0) {
            setGameOver(true);
            setMessage('White wins by timeout.');
          }
        }
        return next;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [currentPlayer, gameOver]);

  const tryMove = (targetRow: number, targetCol: number) => {
    if (!selected) {
      const piece = board[targetRow][targetCol];
      if (piece && piece.color === currentPlayer) {
        setSelected({ row: targetRow, col: targetCol });
        setMessage(`${piece.color === 'w' ? 'White' : 'Black'} piece selected.`);
      }
      return;
    }

    const source = selected;
    const piece = board[source.row][source.col];
    if (!piece) return;

    const target = board[targetRow][targetCol];
    const isLegal = legalMoves.some((move) => move.row === targetRow && move.col === targetCol);

    if (source.row === targetRow && source.col === targetCol) {
      setSelected(null);
      setMessage('Selection cleared.');
      return;
    }

    if (!isLegal) {
      if (piece.color === currentPlayer && target && target.color === currentPlayer) {
        setSelected({ row: targetRow, col: targetCol });
        setMessage('That square is occupied by your own piece.');
      } else {
        setSelected(null);
        setMessage('That move is not allowed.');
      }
      return;
    }

    const nextBoard = cloneBoard(board);
    nextBoard[targetRow][targetCol] = piece;
    nextBoard[source.row][source.col] = null;

    setBoard(nextBoard);
    setSelected(null);
    playTone(soundEnabled);

    const nextPlayer = currentPlayer === 'w' ? 'b' : 'w';
    const nextMessage = `${currentPlayer === 'w' ? 'White' : 'Black'} moved. ${nextPlayer === 'w' ? 'White' : 'Black'} to move.`;
    setCurrentPlayer(nextPlayer);
    setMessage(nextMessage);

    if (gameMode === 'pve' && nextPlayer === 'b') {
      window.setTimeout(() => {
        const botMoveOptions: { from: Coord; to: Coord }[] = [];
        for (let row = 0; row < 8; row += 1) {
          for (let col = 0; col < 8; col += 1) {
            const pieceAt = nextBoard[row][col];
            if (pieceAt?.color === 'b') {
              const moves = getPieceMoves(nextBoard, row, col);
              moves.forEach((move) => {
                botMoveOptions.push({ from: { row, col }, to: move });
              });
            }
          }
        }

        if (botMoveOptions.length) {
          const randomMove = botMoveOptions[Math.floor(Math.random() * botMoveOptions.length)];
          const botBoard = cloneBoard(nextBoard);
          const piece = botBoard[randomMove.from.row][randomMove.from.col];
          if (piece) {
            botBoard[randomMove.to.row][randomMove.to.col] = piece;
            botBoard[randomMove.from.row][randomMove.from.col] = null;
            setBoard(botBoard);
            playTone(soundEnabled);
            setCurrentPlayer('w');
            setMessage('Bot responded with a stylish move.');
          }
        } else {
          setMessage('No bot moves available. Your turn.');
        }
      }, 500);
    }
  };

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${`${seconds % 60}`.padStart(2, '0')}`;

  return (
    <GameShell
      title="Chess"
      description="Make every move with calm precision on a premium wooden board, then switch between player-vs-player or player-vs-bot." 
      accentClass="from-amber-500 to-yellow-700"
      onRestart={restartGame}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="w-full rounded-[28px] border border-amber-400/20 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.25),_transparent_30%),linear-gradient(135deg,_#2d1f0e,_#5b3413)] p-3 shadow-[0_20px_80px_rgba(0,0,0,0.38)] lg:w-[62%]">
          <div className="mb-3 flex items-center justify-between rounded-2xl border border-white/10 bg-black/15 px-3 py-2 text-sm text-amber-100">
            <span>{currentPlayer === 'w' ? 'White to move' : 'Black to move'}</span>
            <span className="font-semibold">{message}</span>
          </div>
          <div className="grid grid-cols-8 gap-0 overflow-hidden rounded-[22px] border border-amber-200/30">
            {board.map((row, rowIndex) =>
              row.map((piece, colIndex) => {
                const isSelected = selected?.row === rowIndex && selected?.col === colIndex;
                const isLegal = legalMoves.some((move) => move.row === rowIndex && move.col === colIndex);
                const isDark = (rowIndex + colIndex) % 2 === 1;
                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => tryMove(rowIndex, colIndex)}
                    className={`relative flex aspect-square items-center justify-center text-3xl font-semibold transition sm:text-4xl ${
                      isDark ? 'bg-[#8b5e3c]' : 'bg-[#f2d3a3]'
                    } ${isSelected ? 'ring-4 ring-amber-300 ring-inset' : ''} ${isLegal ? 'after:absolute after:h-3 after:w-3 after:rounded-full after:bg-amber-950/70' : ''}`}
                  >
                    {piece ? <span className={piece.color === 'w' ? 'text-white' : 'text-slate-900'}>{pieceSymbols[piece.color][piece.type]}</span> : null}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="flex w-full flex-1 flex-col gap-4 rounded-[24px] border border-amber-400/20 bg-slate-950/80 p-5 lg:max-w-[34%]">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-3 text-center">
              <p className="text-sm text-amber-100">White clock</p>
              <p className="text-xl font-semibold text-white">{formatTime(timers.w)}</p>
            </div>
            <div className="rounded-2xl border border-slate-400/20 bg-slate-500/10 p-3 text-center">
              <p className="text-sm text-slate-100">Black clock</p>
              <p className="text-xl font-semibold text-white">{formatTime(timers.b)}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold text-white">Game mode</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(['pvp', 'pve'] as GameMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setGameMode(mode);
                    setMessage(mode === 'pvp' ? 'Player vs Player enabled.' : 'Player vs Bot enabled.');
                  }}
                  className={`rounded-full px-3 py-2 text-sm font-semibold ${gameMode === mode ? 'bg-amber-500 text-slate-950' : 'border border-white/10 text-slate-200'}`}
                >
                  {mode === 'pvp' ? 'Player vs Player' : 'Player vs Bot'}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-100"
          >
            {soundEnabled ? '🔊 Sound on' : '🔈 Sound off'}
          </button>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-400">
            Click a piece, then click a destination square to move. The board highlights legal targets and keeps the match feeling premium and tactical.
          </div>
        </div>
      </div>
    </GameShell>
  );
}
