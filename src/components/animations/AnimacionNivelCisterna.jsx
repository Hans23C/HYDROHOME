import React, { useRef, useEffect, useState } from 'react';
import { Droplet, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';

export const AnimacionNivelCisterna = ({ initialLevel = 0.68, capacity = 5000, title = 'Cisterna Principal' }) => {
  const [level, setLevel] = useState(initialLevel);
  const [isFilling, setIsFilling] = useState(false);

  useEffect(() => {
    setLevel(initialLevel);
  }, [initialLevel]);

  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const phaseRef = useRef({ wave: 0, bubble: 0 });

  const animateToLevel = (newVal) => {
    const clamped = Math.max(0.1, Math.min(1.0, newVal));
    setIsFilling(clamped > level);
    setLevel(clamped);

    if (clamped > level) {
      setTimeout(() => setIsFilling(false), 2000);
    }
  };

  const getStatusInfo = (val) => {
    if (val >= 0.70) return { text: 'Nivel Óptimo', color: '#10B981' };
    if (val >= 0.40) return { text: 'Nivel Normal', color: '#0EA5E9' };
    if (val >= 0.20) return { text: 'Nivel Medio', color: '#F59E0B' };
    return { text: 'Nivel Crítico', color: '#EF4444' };
  };

  const status = getStatusInfo(level);
  const currentLiters = Math.round(capacity * level).toLocaleString();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const updateSize = () => {
      if (canvas.parentElement) {
        const rect = canvas.parentElement.getBoundingClientRect();
        if (rect.width > 0 && canvas.width !== Math.floor(rect.width)) {
          canvas.width = Math.floor(rect.width);
        }
      }
    };
    updateSize();

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const render = () => {
      phaseRef.current.wave = (phaseRef.current.wave + 0.025) % (Math.PI * 2);
      phaseRef.current.bubble = (phaseRef.current.bubble + 0.012) % 1.0;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const paddingX = 8;
      const paddingY = 12;
      const tankWidth = Math.max(40, width - paddingX * 2);
      const tankHeight = Math.max(40, height - paddingY * 2);
      const radius = 16;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(paddingX, paddingY, tankWidth, tankHeight, radius);
      ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#091624' : '#E2E8F0';
      ctx.fill();
      ctx.clip();

      const waterHeight = tankHeight * level;
      const waterSurfaceY = paddingY + tankHeight - waterHeight;

      ctx.beginPath();
      ctx.moveTo(paddingX, waterSurfaceY);
      for (let x = paddingX; x <= paddingX + tankWidth; x += 4) {
        const nx = (x - paddingX) / tankWidth;
        const y = waterSurfaceY + Math.sin(nx * Math.PI * 2 + phaseRef.current.wave) * 4;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(paddingX + tankWidth, paddingY + tankHeight);
      ctx.lineTo(paddingX, paddingY + tankHeight);
      ctx.closePath();

      const backGrad = ctx.createLinearGradient(0, waterSurfaceY, 0, paddingY + tankHeight);
      backGrad.addColorStop(0, 'rgba(2, 132, 199, 0.45)');
      backGrad.addColorStop(1, 'rgba(7, 89, 133, 0.7)');
      ctx.fillStyle = backGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(paddingX, waterSurfaceY);
      for (let x = paddingX; x <= paddingX + tankWidth; x += 4) {
        const nx = (x - paddingX) / tankWidth;
        const y = waterSurfaceY + Math.cos(nx * Math.PI * 2.5 + phaseRef.current.wave + 1.2) * 5;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(paddingX + tankWidth, paddingY + tankHeight);
      ctx.lineTo(paddingX, paddingY + tankHeight);
      ctx.closePath();

      const frontGrad = ctx.createLinearGradient(0, waterSurfaceY, 0, paddingY + tankHeight);
      frontGrad.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
      frontGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.9)');
      frontGrad.addColorStop(1, 'rgba(3, 105, 161, 0.95)');
      ctx.fillStyle = frontGrad;
      ctx.fill();

      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      for (let i = 0; i < 8; i++) {
        const seed = i * 0.73;
        const cycle = (phaseRef.current.bubble + seed) % 1.0;
        const bx = paddingX + tankWidth * (0.15 + ((i * 0.11) % 0.7));
        const by = paddingY + tankHeight - waterHeight * cycle;
        const wiggleX = bx + Math.sin(cycle * Math.PI * 4 + i) * 3;
        const bRadius = 1.8 + (i % 3) * 0.9;

        if (by >= waterSurfaceY) {
          ctx.beginPath();
          ctx.arc(wiggleX, by, bRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (isFilling || level < 0.25) {
        const streamX = paddingX + tankWidth * 0.5 - 5;
        const streamGrad = ctx.createLinearGradient(0, 0, 0, waterSurfaceY);
        streamGrad.addColorStop(0, 'rgba(56, 189, 248, 0.9)');
        streamGrad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');
        ctx.fillStyle = streamGrad;
        ctx.fillRect(streamX, 0, 10, waterSurfaceY);
      }

      ctx.restore();

      ctx.beginPath();
      ctx.roundRect(paddingX, paddingY, tankWidth, tankHeight, radius);
      ctx.lineWidth = 2;
      ctx.strokeStyle = document.documentElement.classList.contains('dark') ? 'rgba(56, 189, 248, 0.45)' : 'rgba(8, 127, 173, 0.35)';
      ctx.stroke();

      const capWidth = 42;
      const capHeight = 8;
      ctx.beginPath();
      ctx.roundRect(paddingX + tankWidth / 2 - capWidth / 2, paddingY - 5, capWidth, capHeight, 4);
      ctx.fillStyle = '#38BDF8';
      ctx.fill();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
    };
  }, [level, isFilling]);

  return (
    <div className="liquid-glass p-6 sm:p-7 overflow-hidden space-y-4">
      {/* Cabecera amplia */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-sky-500/15 border border-sky-400/30 text-sky-500 shrink-0">
            <Droplet className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate">
              {title}
            </h3>
            <p className="text-xs sm:text-sm font-semibold truncate mt-0.5" style={{ color: status.color }}>
              {status.text} · {currentLiters} L de {capacity.toLocaleString()} L
            </p>
          </div>
        </div>

        <span className="font-mono text-3xl sm:text-4xl font-extrabold text-sky-500 dark:text-sky-400 shrink-0">
          {Math.round(level * 100)}%
        </span>
      </div>

      {/* Tanque de agua a ancho completo */}
      <div className="w-full h-[175px] sm:h-[190px] relative">
        <canvas
          ref={canvasRef}
          width={380}
          height={180}
          className="w-full h-full block"
        />
      </div>

      {/* Controles rápidos de prueba espaciados */}
      <div className="pt-3 border-t border-slate-200 dark:border-sky-400/15 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold">
          Simular nivel:
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => animateToLevel(level + 0.15)}
            className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition cursor-pointer"
          >
            <ArrowUp className="w-4 h-4" /> Llenar
          </button>
          <button
            onClick={() => animateToLevel(level - 0.15)}
            className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition cursor-pointer"
          >
            <ArrowDown className="w-4 h-4" /> Vaciar
          </button>
          <button
            onClick={() => animateToLevel(0.68)}
            className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 hover:bg-sky-500/25 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> 68%
          </button>
        </div>
      </div>
    </div>
  );
};
