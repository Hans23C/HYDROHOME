import React, { useEffect } from 'react';
import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas';

export const BotonFlotanteSoporteIA = ({ onClick }) => {
  const { rive, RiveComponent } = useRive({
    src: '/assets/Animaciones/Bot.riv',
    autoplay: true,
    layout: new Layout({
      fit: Fit.Cover,
      alignment: Alignment.Center,
    }),
  });

  useEffect(() => {
    if (!rive) return;
    if (rive.stateMachineNames?.length) {
      rive.play(rive.stateMachineNames[0]);
    } else if (rive.animationNames?.length) {
      rive.play(rive.animationNames);
    }
  }, [rive]);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Soporte IA"
      title="Abrir Soporte IA"
      className="absolute bottom-24 right-4 z-40 w-20 h-20 rounded-full overflow-hidden bg-slate-900 shadow-2xl shadow-cyan-500/40 border border-cyan-400/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer p-0"
    >
      <div className="w-full h-full overflow-hidden rounded-full flex items-center justify-center relative">
        <div className="w-full h-full flex items-center justify-center scale-[3.8] transform-gpu pointer-events-none">
          <RiveComponent className="w-full h-full block pointer-events-none" />
        </div>
      </div>
    </button>
  );
};

export default BotonFlotanteSoporteIA;
