'use client';

import { useEffect, useRef, useState } from 'react';
import GameShell from '@/app/components/GameShell';

const W = 520;
const H = 760;
const PADDLE_W = 95;
const PADDLE_H = 24;
const BALL = 14;

export default function GalaxyShooterPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keys = useRef<Record<string, boolean>>({});
  const raf = useRef<number | null>(null);

  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [status, setStatus] = useState('Ready');
  const [running, setRunning] = useState(true);

  const game = useRef({
    playerX: W / 2 - PADDLE_W / 2,
    botX: W / 2 - PADDLE_W / 2,
    ballX: W / 2,
    ballY: H / 2,
    vx: 4,
    vy: 5,
    speed: 1,
  });

  const resetBall = (towardsPlayer = true) => {
    game.current.ballX = W / 2;
    game.current.ballY = H / 2;
    game.current.vx = Math.random() > 0.5 ? 4 : -4;
    game.current.vy = towardsPlayer ? 5 : -5;
    game.current.speed = 1;
  };

  const resetGame = () => {
    setPlayerScore(0);
    setBotScore(0);
    setStatus('Ready');
    setRunning(true);
    game.current = {
      playerX: W / 2 - PADDLE_W / 2,
      botX: W / 2 - PADDLE_W / 2,
      ballX: W / 2,
      ballY: H / 2,
      vx: 4,
      vy: 5,
      speed: 1,
    };
  };

  const drawPaddle = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color1: string,
    color2: string
  ) => {
    const grad = ctx.createLinearGradient(x, y, x + PADDLE_W, y + PADDLE_H);
    grad.addColorStop(0, color1);
    grad.addColorStop(1, color2);

    ctx.shadowBlur = 24;
    ctx.shadowColor = color1;
    ctx.fillStyle = grad;
    ctx.roundRect(x, y, PADDLE_W, PADDLE_H, 14);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,.55)';
    ctx.lineWidth = 2;
    ctx.roundRect(x, y, PADDLE_W, PADDLE_H, 14);
    ctx.stroke();
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    const g = game.current;
    ctx.clearRect(0, 0, W, H);

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#facc15');
    bg.addColorStop(0.5, '#fb7185');
    bg.addColorStop(1, '#38bdf8');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#ff7a59';
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 8;
    ctx.roundRect(70, 70, W - 140, H - 140, 8);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(70, H / 2);
    ctx.lineTo(W - 70, H / 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255,255,255,.45)';
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.moveTo(W / 2, 70);
    ctx.lineTo(W / 2, H - 70);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255,255,255,.75)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(W / 2, H / 2 - 95, 28, 52, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(W / 2, H / 2 + 95, 28, 52, 0, 0, Math.PI * 2);
    ctx.stroke();

    drawPaddle(ctx, g.botX, 42, '#14b8a6', '#06b6d4');
    drawPaddle(ctx, g.playerX, H - 66, '#f43f5e', '#fb7185');

    ctx.shadowBlur = 20;
    ctx.shadowColor = '#fff';
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(g.ballX, g.ballY, BALL, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,.25)';
    ctx.beginPath();
    ctx.arc(g.ballX + 10, g.ballY + 10, BALL * 0.8, 0, Math.PI * 2);
    ctx.fill();
  };

  const update = () => {
    if (!running) return;

    const g = game.current;

    if (keys.current.ArrowLeft || keys.current.a) g.playerX -= 8;
    if (keys.current.ArrowRight || keys.current.d) g.playerX += 8;
    g.playerX = Math.max(70, Math.min(W - 70 - PADDLE_W, g.playerX));

    const botCenter = g.botX + PADDLE_W / 2;
    if (botCenter < g.ballX) g.botX += 4.5;
    if (botCenter > g.ballX) g.botX -= 4.5;
    g.botX = Math.max(70, Math.min(W - 70 - PADDLE_W, g.botX));

    g.ballX += g.vx * g.speed;
    g.ballY += g.vy * g.speed;

    if (g.ballX < 85 || g.ballX > W - 85) g.vx *= -1;

    const hitPlayer =
      g.ballY + BALL >= H - 66 &&
      g.ballY <= H - 42 &&
      g.ballX >= g.playerX &&
      g.ballX <= g.playerX + PADDLE_W;

    const hitBot =
      g.ballY - BALL <= 66 &&
      g.ballY >= 42 &&
      g.ballX >= g.botX &&
      g.ballX <= g.botX + PADDLE_W;

    if (hitPlayer) {
      g.vy = -Math.abs(g.vy);
      g.speed += 0.06;
      setStatus('Nice hit!');
    }

    if (hitBot) {
      g.vy = Math.abs(g.vy);
      g.speed += 0.05;
      setStatus('Bot returned!');
    }

    if (g.ballY < 0) {
      setPlayerScore((s) => s + 1);
      setStatus('You scored!');
      resetBall(true);
    }

    if (g.ballY > H) {
      setBotScore((s) => s + 1);
      setStatus('Bot scored!');
      resetBall(false);
    }
  };

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      update();
      draw(ctx);
      raf.current = requestAnimationFrame(loop);
    };

    loop();

    const down = (e: KeyboardEvent) => (keys.current[e.key] = true);
    const up = (e: KeyboardEvent) => (keys.current[e.key] = false);

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [running]);

  const moveTouch = (dir: 'left' | 'right') => {
    game.current.playerX += dir === 'left' ? -34 : 34;
    game.current.playerX = Math.max(70, Math.min(W - 70 - PADDLE_W, game.current.playerX));
  };

  return (
    <GameShell
      title="Paddle Battle"
      description="Fast table tennis battle. Move your paddle, beat the bot, and score like a champion."
      accentClass="from-yellow-400 to-rose-500"
      onRestart={resetGame}
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="rounded-[34px] border border-white/10 bg-slate-950/80 p-5 shadow-[0_30px_90px_rgba(0,0,0,.45)]">
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
            <span className="font-black text-cyan-200">🏓 Player {playerScore}</span>
            <span className="rounded-full bg-white px-4 py-1 text-sm font-black text-black">VS</span>
            <span className="font-black text-rose-200">Bot {botScore}</span>
          </div>

          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="mx-auto w-full max-w-[620px] rounded-[28px] border-4 border-black shadow-[0_0_50px_rgba(34,211,238,.25)]"
          />
        </div>

        <div className="space-y-4 rounded-[32px] border border-white/10 bg-slate-950/80 p-5">
          <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4">
            <p className="text-sm text-cyan-200">Status</p>
            <p className="text-3xl font-black text-white">{status}</p>
          </div>

          <div className="rounded-2xl border border-yellow-400/30 bg-yellow-500/10 p-4 text-yellow-100">
            Controls: Arrow Left / Right અથવા A / D. Mobile માટે નીચે buttons.
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => moveTouch('left')}
              className="rounded-2xl bg-cyan-500/20 px-5 py-4 font-black text-cyan-100"
            >
              ◀ Left
            </button>
            <button
              onClick={() => moveTouch('right')}
              className="rounded-2xl bg-cyan-500/20 px-5 py-4 font-black text-cyan-100"
            >
              Right ▶
            </button>
          </div>

          <button
            onClick={() => setRunning((v) => !v)}
            className="w-full rounded-2xl bg-gradient-to-r from-yellow-400 to-rose-500 px-5 py-4 font-black text-black"
          >
            {running ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>
    </GameShell>
  );
}