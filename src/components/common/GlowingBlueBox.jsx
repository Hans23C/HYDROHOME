import React from 'react';

const GLOW_PALETTES = {
  good: {
    gradient:
      'conic-gradient(from 0deg, #064e3b 0deg, #10b981 90deg, #34d399 160deg, #10b981 240deg, #064e3b 360deg)',
    intenseShadow:
      '0 0 32px rgba(16, 185, 129, 0.45), 0 0 60px rgba(52, 211, 153, 0.28)',
    subtleShadow:
      '0 0 14px rgba(16, 185, 129, 0.18), 0 0 28px rgba(52, 211, 153, 0.10)',
    staticBorder: 'border-emerald-500/30 dark:border-emerald-500/30',
  },
  warning: {
    gradient:
      'conic-gradient(from 0deg, #78350f 0deg, #f59e0b 90deg, #fde047 160deg, #f59e0b 240deg, #78350f 360deg)',
    intenseShadow:
      '0 0 32px rgba(251, 191, 36, 0.45), 0 0 60px rgba(245, 158, 11, 0.28)',
    subtleShadow:
      '0 0 14px rgba(251, 191, 36, 0.18), 0 0 28px rgba(245, 158, 11, 0.10)',
    staticBorder: 'border-amber-400/35 dark:border-amber-400/30',
  },
  excess: {
    gradient:
      'conic-gradient(from 0deg, #4c0519 0deg, #e11d48 90deg, #ff3b6b 160deg, #e11d48 240deg, #4c0519 360deg)',
    intenseShadow:
      '0 0 32px rgba(244, 63, 94, 0.48), 0 0 60px rgba(225, 29, 72, 0.30)',
    subtleShadow:
      '0 0 14px rgba(244, 63, 94, 0.20), 0 0 28px rgba(225, 29, 72, 0.12)',
    staticBorder: 'border-rose-500/35 dark:border-rose-500/30',
  },
  blue: {
    gradient:
      'conic-gradient(from 0deg, #001a4d 0deg, #0066ff 90deg, #00f0ff 160deg, #0066ff 240deg, #001a4d 360deg)',
    intenseShadow:
      '0 0 32px rgba(0, 240, 255, 0.40), 0 0 60px rgba(0, 102, 255, 0.25)',
    subtleShadow:
      '0 0 14px rgba(0, 240, 255, 0.16), 0 0 28px rgba(0, 102, 255, 0.10)',
    staticBorder: 'border-slate-200/80 dark:border-cyan-500/25',
  },
};

export const GlowingBlueBox = React.forwardRef(
  (
    {
      children,
      isGenerating = false,
      glowColor = 'good',
      isIntense = false,
      className = '',
    },
    ref
  ) => {
    const palette = GLOW_PALETTES[glowColor] || GLOW_PALETTES.blue;

    const currentShadow = !isGenerating
      ? 'none'
      : isIntense
      ? palette.intenseShadow
      : palette.subtleShadow;

    return (
      <div
        ref={ref}
        className={`relative rounded-3xl transition-all duration-700 ${className}`}
        style={{ boxShadow: currentShadow }}
      >
        {/* Resplandor neón difuminado detrás del borde */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute -inset-1.5 rounded-[28px] overflow-hidden transition-all duration-700 ${
            !isGenerating
              ? 'opacity-0 blur-md'
              : isIntense
              ? 'opacity-90 blur-lg'
              : 'opacity-40 blur-md'
          }`}
        >
          <div
            className="absolute inset-[-100%] animate-hydro-glow"
            style={{ background: palette.gradient }}
          />
        </div>

        {/* Contenedor con borde giratorio de 2px */}
        <div className="relative rounded-3xl p-[2px] overflow-hidden">
          {/* Borde estático sutil cuando isGenerating es false */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 rounded-3xl border transition-opacity duration-500 ${
              isGenerating
                ? 'opacity-0 border-transparent'
                : `opacity-100 ${palette.staticBorder}`
            }`}
          />

          {/* Degradado giratorio infinito cuando isGenerating es true */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-[-100%] animate-hydro-glow transition-opacity duration-700 ${
              !isGenerating
                ? 'opacity-0'
                : isIntense
                ? 'opacity-100'
                : 'opacity-70'
            }`}
            style={{ background: palette.gradient }}
          />

          {/* Contenido interno de la tarjeta */}
          <div className="relative rounded-[22px] bg-white dark:bg-[#0E1A29] overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    );
  }
);

GlowingBlueBox.displayName = 'GlowingBlueBox';

export default GlowingBlueBox;
