import { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * ParticulasBot
 * Fondo atmosférico HTML5 Canvas (60 FPS) de burbujas hídricas y ondas de sonar
 * con detección en tiempo real de Modo Claro / Modo Oscuro y alto contraste garantizado.
 */
export const ParticulasBot = ({ className = '' }) => {
  const canvasRef = useRef(null);
  const { isDark: contextIsDark } = useAuth() || {};
  const isDarkRef = useRef(false);

  const leerTemaActual = () => {
    if (typeof contextIsDark === 'boolean') return contextIsDark;
    if (typeof document === 'undefined') return false;
    return (
      document.documentElement.classList.contains('dark') ||
      document.body?.classList.contains('dark') ||
      false
    );
  };

  isDarkRef.current = leerTemaActual();

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const sincronizarTema = () => {
      if (typeof contextIsDark === 'boolean') {
        isDarkRef.current = contextIsDark;
      } else {
        isDarkRef.current =
          document.documentElement.classList.contains('dark') ||
          document.body?.classList.contains('dark') ||
          false;
      }
    };

    sincronizarTema();

    const observer = new MutationObserver(() => {
      const domDark =
        document.documentElement.classList.contains('dark') ||
        document.body?.classList.contains('dark') ||
        false;
      isDarkRef.current =
        typeof contextIsDark === 'boolean' ? contextIsDark : domDark;
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });

    if (document.body) {
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class', 'data-theme'],
      });
    }

    return () => observer.disconnect();
  }, [contextIsDark]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let animationFrameId = null;
    let width = 0;
    let height = 0;
    const pointer = { x: null, y: null, active: false };

    const crearParticula = (inicial = false, w = 400, h = 700) => ({
      x: Math.random() * w,
      y: inicial ? Math.random() * h : h + 10 + Math.random() * 40,
      radius: 2.5 + Math.random() * 4.5, // 2.5px a 7px
      speedY: 0.35 + Math.random() * 0.65,
      wobbleAmp: 0.25 + Math.random() * 0.55,
      wobbleFreq: 0.012 + Math.random() * 0.018,
      phase: Math.random() * Math.PI * 2,
      variant: Math.random() < 0.55 ? 0 : 1,
      vx: 0,
      vy: 0,
    });

    const particulas = [];
    const TOTAL_PARTICULAS = 32;

    const ondas = [0, 1, 2].map((i) => ({
      progress: i / 3,
    }));

    const ajustarTamano = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(rect.width, 1);
      height = Math.max(rect.height, 1);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (particulas.length === 0) {
        for (let i = 0; i < TOTAL_PARTICULAS; i += 1) {
          particulas.push(crearParticula(true, width, height));
        }
      }
    };

    ajustarTamano();

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(ajustarTamano)
        : null;
    if (resizeObserver) {
      resizeObserver.observe(canvas);
    }
    window.addEventListener('resize', ajustarTamano);

    const actualizarPuntero = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = clientX - rect.left;
      pointer.y = clientY - rect.top;
      pointer.active = true;
    };

    const onPointerMove = (e) => actualizarPuntero(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        actualizarPuntero(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);

    let tick = 0;

    const dibujar = () => {
      tick += 1;
      ctx.clearRect(0, 0, width, height);

      const dark = isDarkRef.current;

      // Paleta calibrada por tema
      const fills = dark
        ? ['rgba(34, 211, 238, 0.35)', 'rgba(148, 163, 184, 0.30)']
        : ['rgba(2, 132, 199, 0.35)', 'rgba(37, 99, 235, 0.28)'];
      const strokeColor = dark
        ? 'rgba(56, 189, 248, 0.65)'
        : 'rgba(3, 105, 161, 0.65)';
      const sonarBase = dark
        ? [34, 211, 238, 0.18]
        : [14, 165, 233, 0.22];

      // 1. Ondas de sonar hídricas concéntricas (3 anillos suaves desde el centro)
      const cx = width * 0.5;
      const cy = height * 0.54;
      const maxRadius = Math.max(width, height) * 0.45;

      for (let i = 0; i < ondas.length; i += 1) {
        const onda = ondas[i];
        onda.progress += 0.0022;
        if (onda.progress >= 1) onda.progress = 0;

        const r = 36 + onda.progress * maxRadius;
        const alpha = sonarBase[3] * (1 - onda.progress);

        if (alpha > 0.005) {
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${sonarBase[0]}, ${sonarBase[1]}, ${sonarBase[2]}, ${alpha.toFixed(3)})`;
          ctx.lineWidth = 1.4;
          ctx.stroke();
        }
      }

      // 2. Burbujas y nodos acuáticos flotantes (32 partículas)
      for (let i = 0; i < particulas.length; i += 1) {
        const p = particulas[i];

        p.y -= p.speedY;
        p.x += Math.sin(tick * p.wobbleFreq + p.phase) * p.wobbleAmp;

        // Reacción suave al cursor / toque
        if (pointer.active && pointer.x !== null && pointer.y !== null) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const distSq = dx * dx + dy * dy;
          const radioInteraccion = 95;
          if (distSq > 1 && distSq < radioInteraccion * radioInteraccion) {
            const dist = Math.sqrt(distSq);
            const fuerza = ((radioInteraccion - dist) / radioInteraccion) * 0.45;
            p.vx += (dx / dist) * fuerza;
            p.vy += (dy / dist) * fuerza;
          }
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.92;
        p.vy *= 0.92;

        if (p.y < -p.radius * 2) {
          particulas[i] = crearParticula(false, width, height);
        } else if (p.x < -20) {
          p.x = width + 10;
        } else if (p.x > width + 20) {
          p.x = -10;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = fills[p.variant];
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = strokeColor;
        ctx.stroke();
      }

      animationFrameId = window.requestAnimationFrame(dibujar);
    };

    animationFrameId = window.requestAnimationFrame(dibujar);

    return () => {
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', ajustarTamano);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return (
    <div className={`pointer-events-none w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="w-full h-full block pointer-events-none"
      />
    </div>
  );
};

export default ParticulasBot;
