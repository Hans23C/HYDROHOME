import React, { useRef, useEffect, useState } from 'react';
import { Waves, Pause, Play, Gauge } from 'lucide-react';

export const AnimacionFlujoAgua = ({ initialFlowing = true }) => {
  const [isFlowing, setIsFlowing] = useState(initialFlowing);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const phaseRef = useRef(0);

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
      if (isFlowing) {
        phaseRef.current = (phaseRef.current + 0.04) % 1.0;
      }

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const pipeY = height / 2 - 14;
      const pipeH = 28;
      const radius = 14;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(4, pipeY, Math.max(20, width - 8), pipeH, radius);
      ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#091624' : '#E2E8F0';
      ctx.fill();
      ctx.clip();

      if (isFlowing) {
        const grad = ctx.createLinearGradient(0, pipeY, width, pipeY);
        grad.addColorStop(0, '#0284C7');
        grad.addColorStop(0.5, '#38BDF8');
        grad.addColorStop(1, '#0284C7');
        ctx.fillStyle = grad;
        ctx.fillRect(4, pipeY, width - 8, pipeH);

        const count = 10;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        for (let i = 0; i < count; i++) {
          const t = (i / count + phaseRef.current) % 1.0;
          const x = 4 + t * (width - 8);
          const y = pipeY + pipeH / 2 + Math.sin(t * Math.PI * 4 + i) * 4;
          const r = 2.2 + (i % 2) * 1.1;

          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.fillRect(4, pipeY, width - 8, pipeH);
      }

      ctx.restore();

      ctx.beginPath();
      ctx.roundRect(4, pipeY, Math.max(20, width - 8), pipeH, radius);
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = document.documentElement.classList.contains('dark')
        ? 'rgba(56, 189, 248, 0.45)'
        : 'rgba(8, 127, 173, 0.4)';
      ctx.stroke();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
    };
  }, [isFlowing]);

  return (
    <div className="liquid-glass p-6 sm:p-7 overflow-hidden space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${
              isFlowing
                ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-400'
                : 'bg-slate-500/15 border-slate-400/30 text-slate-400'
            }`}
          >
            <Waves className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate">
              Flujo de Tubería Principal
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {isFlowing ? 'Circulación activa · 3.2 bar' : 'Flujo en pausa'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsFlowing(!isFlowing)}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 border transition shrink-0 cursor-pointer ${
            isFlowing
              ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-400/30'
              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-400/30'
          }`}
        >
          {isFlowing ? (
            <>
              <Pause className="w-4 h-4" /> Pausar
            </>
          ) : (
            <>
              <Play className="w-4 h-4" /> Reanudar
            </>
          )}
        </button>
      </div>

      <div className="h-14 w-full">
        <canvas ref={canvasRef} width={450} height={56} className="w-full h-full block" />
      </div>

      <div className="flex items-center justify-between text-xs sm:text-sm pt-3 border-t border-slate-200 dark:border-sky-400/15">
        <span className="font-mono text-sky-600 dark:text-sky-400 font-bold flex items-center gap-1.5">
          <Gauge className="w-4 h-4" />
          {isFlowing ? '14.5 L/min' : '0.0 L/min'}
        </span>
        <span className="text-slate-500 dark:text-slate-400 font-medium">
          Presión: <strong className="text-slate-800 dark:text-slate-200">{isFlowing ? '3.2 bar' : '0.0 bar'}</strong>
        </span>
      </div>
    </div>
  );
};
