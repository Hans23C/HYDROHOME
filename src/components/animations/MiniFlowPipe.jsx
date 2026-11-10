import React, { useRef, useEffect } from 'react';

export const MiniFlowPipe = ({ color = '#10B981', isDark = true }) => {
  const canvasRef = useRef(null);
  const phaseRef = useRef(0);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      phaseRef.current = (phaseRef.current + 0.035) % 1.0;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Canal
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, width, height, 6);
      ctx.fillStyle = isDark ? '#132233' : '#E2E8F0';
      ctx.fill();
      ctx.clip();

      // Flujo de fondo con gradiente
      const grad = ctx.createLinearGradient(0, 0, width, 0);
      grad.addColorStop(0, `${color}40`);
      grad.addColorStop(0.5, `${color}CC`);
      grad.addColorStop(1, `${color}60`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Gotas en movimiento
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 5; i++) {
        const t = (i / 5.0 + phaseRef.current) % 1.0;
        const x = t * width;
        ctx.beginPath();
        ctx.arc(x, height / 2, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [color, isDark]);

  return (
    <div className="w-full h-3">
      <canvas ref={canvasRef} width={280} height={12} className="w-full h-full block" />
    </div>
  );
};
