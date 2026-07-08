'use client';

import { useEffect, useRef, useState } from 'react';
import GameShell from '@/app/components/GameShell';

type Ball = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  number?: number;
  pocketed?: boolean;
};

const W = 900;
const H = 520;
const FRICTION = 0.985;
const ballsStart: Ball[] = [
  { id: 0, x: 230, y: 260, vx: 0, vy: 0, r: 14, color: '#fffbe8' },
  ...Array.from({ length: 10 }).map((_, i) => ({
    id: i + 1,
    x: 610 + (i % 4) * 32,
    y: 220 + Math.floor(i / 4) * 34,
    vx: 0,
    vy: 0,
    r: 14,
    color: ['#f43f5e', '#3b82f6', '#f59e0b', '#22c55e', '#a855f7'][i % 5],
    number: i + 1,
  })),
];

export default function PoolPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [balls, setBalls] = useState<Ball[]>(ballsStart);
  const ballsRef = useRef<Ball[]>(ballsStart);
  const [score, setScore] = useState(0);
  const [aim, setAim] = useState<{ x: number; y: number } | null>(null);
  const [drag, setDrag] = useState(false);
  const [power, setPower] = useState(0);

  const pockets = [
    [42, 42],
    [W / 2, 32],
    [W - 42, 42],
    [42, H - 42],
    [W / 2, H - 32],
    [W - 42, H - 42],
  ];

  function resetGame() {
    ballsRef.current = structuredClone(ballsStart);
    setBalls(structuredClone(ballsStart));
    setScore(0);
    setAim(null);
    setPower(0);
  }

  function draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, W, H);

    const wood = ctx.createLinearGradient(0, 0, W, H);
    wood.addColorStop(0, '#6b2f12');
    wood.addColorStop(0.5, '#b56b2a');
    wood.addColorStop(1, '#3b1708');
    ctx.fillStyle = wood;
    ctx.roundRect(0, 0, W, H, 34);
    ctx.fill();

    ctx.fillStyle = '#0f6b3b';
    ctx.roundRect(44, 44, W - 88, H - 88, 24);
    ctx.fill();

    ctx.strokeStyle = '#e5b85c';
    ctx.lineWidth = 6;
    ctx.roundRect(58, 58, W - 116, H - 116, 18);
    ctx.stroke();

    pockets.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.fillStyle = '#030712';
      ctx.arc(x, y, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f6c66b';
      ctx.lineWidth = 4;
      ctx.stroke();
    });

    const cue = ballsRef.current.find((b) => b.id === 0 && !b.pocketed);

    if (cue && aim) {
      ctx.strokeStyle = 'rgba(255,255,255,.75)';
      ctx.setLineDash([8, 8]);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cue.x, cue.y);
      ctx.lineTo(cue.x + (cue.x - aim.x) * 2, cue.y + (cue.y - aim.y) * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = '#d8a15a';
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(aim.x, aim.y);
      ctx.lineTo(cue.x, cue.y);
      ctx.stroke();
    }

    ballsRef.current.forEach((b) => {
      if (b.pocketed) return;

      ctx.beginPath();
      ctx.fillStyle = 'rgba(0,0,0,.35)';
      ctx.ellipse(b.x + 6, b.y + 8, b.r, b.r * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();

      const grad = ctx.createRadialGradient(b.x - 5, b.y - 6, 2, b.x, b.y, b.r);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.22, b.color);
      grad.addColorStop(1, '#111827');

      ctx.beginPath();
      ctx.fillStyle = grad;
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,.75)';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (b.number) {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(b.x, b.y, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#111';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(b.number), b.x, b.y);
      }
    });
  }

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      const next = ballsRef.current.map((b) => {
        if (b.pocketed) return b;
        let x = b.x + b.vx;
        let y = b.y + b.vy;
        let vx = b.vx * FRICTION;
        let vy = b.vy * FRICTION;

        if (Math.abs(vx) < 0.03) vx = 0;
        if (Math.abs(vy) < 0.03) vy = 0;

        if (x < 72 || x > W - 72) vx *= -0.92;
        if (y < 72 || y > H - 72) vy *= -0.92;

        x = Math.max(72, Math.min(W - 72, x));
        y = Math.max(72, Math.min(H - 72, y));

        const pocketed = pockets.some(([px, py]) => Math.hypot(x - px, y - py) < 26);
        if (pocketed && b.id !== 0) {
          setScore((s) => s + 10);
          return { ...b, pocketed: true, vx: 0, vy: 0 };
        }

        if (pocketed && b.id === 0) {
          return { ...b, x: 230, y: 260, vx: 0, vy: 0 };
        }

        return { ...b, x, y, vx, vy };
      });

      for (let i = 0; i < next.length; i++) {
        for (let j = i + 1; j < next.length; j++) {
          const a = next[i];
          const b = next[j];
          if (a.pocketed || b.pocketed) continue;

          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy);
          const min = a.r + b.r;

          if (dist > 0 && dist < min) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = min - dist;

            a.x -= nx * overlap / 2;
            a.y -= ny * overlap / 2;
            b.x += nx * overlap / 2;
            b.y += ny * overlap / 2;

            const tx = -ny;
            const ty = nx;

            const dpTan1 = a.vx * tx + a.vy * ty;
            const dpTan2 = b.vx * tx + b.vy * ty;
            const dpNorm1 = a.vx * nx + a.vy * ny;
            const dpNorm2 = b.vx * nx + b.vy * ny;

            a.vx = tx * dpTan1 + nx * dpNorm2;
            a.vy = ty * dpTan1 + ny * dpNorm2;
            b.vx = tx * dpTan2 + nx * dpNorm1;
            b.vy = ty * dpTan2 + ny * dpNorm1;
          }
        }
      }

      ballsRef.current = next;
      draw(ctx);
      requestAnimationFrame(loop);
    };

    loop();
  }, []);

  function getPoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * W,
      y: ((e.clientY - rect.top) / rect.height) * H,
    };
  }

  function down(e: React.PointerEvent<HTMLCanvasElement>) {
    const cue = ballsRef.current.find((b) => b.id === 0 && !b.pocketed);
    if (!cue) return;
    const p = getPoint(e);
    if (Math.hypot(p.x - cue.x, p.y - cue.y) < 45) {
      setDrag(true);
      setAim(p);
    }
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drag) return;
    const p = getPoint(e);
    setAim(p);

    const cue = ballsRef.current.find((b) => b.id === 0 && !b.pocketed);
    if (cue) setPower(Math.min(100, Math.hypot(p.x - cue.x, p.y - cue.y) / 2));
  }

  function up() {
    if (!drag || !aim) return;
    const cue = ballsRef.current.find((b) => b.id === 0 && !b.pocketed);
    if (!cue) return;

    const dx = cue.x - aim.x;
    const dy = cue.y - aim.y;
    const len = Math.max(1, Math.hypot(dx, dy));
    const force = Math.min(18, len / 8);

    ballsRef.current = ballsRef.current.map((b) =>
      b.id === 0 ? { ...b, vx: (dx / len) * force, vy: (dy / len) * force } : b
    );

    setDrag(false);
    setAim(null);
    setPower(0);
  }

  return (
    <GameShell
      title="Pool Master"
      description="Aim, pull the cue, hit the ball, and pocket every ball on a premium 8-ball table."
      accentClass="from-emerald-400 to-lime-500"
      onRestart={resetGame}
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_330px]">
        <div className="rounded-[32px] border border-amber-300/30 bg-gradient-to-br from-amber-950/50 to-slate-950 p-5 shadow-[0_30px_90px_rgba(0,0,0,.45)]">
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
            <span className="font-bold text-emerald-200">🎱 Your Turn</span>
            <span className="font-bold text-yellow-200">Score: {score}</span>
          </div>

          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerLeave={up}
            className="w-full touch-none rounded-[28px] border-4 border-amber-700 bg-emerald-900 shadow-[inset_0_0_50px_rgba(0,0,0,.7),0_0_40px_rgba(16,185,129,.25)]"
          />
        </div>

        <div className="space-y-4 rounded-[32px] border border-white/10 bg-slate-950/80 p-5">
          <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4">
            <p className="text-sm text-cyan-200">Power</p>
            <p className="text-3xl font-black text-white">{Math.round(power)}%</p>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-fuchsia-500"
                style={{ width: `${power}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-amber-100">
            Drag cue ball પાછળથી ખેંચો, aim line જુઓ અને release કરો.
          </div>

          <button
            onClick={resetGame}
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-lime-500 px-5 py-4 font-black text-black"
          >
            Restart Game
          </button>
        </div>
      </div>
    </GameShell>
  );
}