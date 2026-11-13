import React from 'react';

/**
 * Componente de borde eléctrico/plasma inspirado en el trabajo de Bálint Ferenczy.
 * Envuelve cualquier elemento con un borde reactivo de corriente viva y destellos de energía.
 */
export const BordeElectrico = ({ children, color = '#EF4444', className = '' }) => {
  return (
    <div className={`relative p-[1.5px] rounded-2xl overflow-hidden group ${className}`}>
      {/* Capa de corriente eléctrica en rotación continua */}
      <div
        className="absolute inset-[-100%] rounded-2xl animate-[spin_4s_linear_infinite]"
        style={{
          background: `conic-gradient(from 0deg, transparent 0%, ${color} 25%, transparent 50%, #38BDF8 75%, transparent 100%)`,
        }}
      />

      {/* Capa de resplandor difuso */}
      <div
        className="absolute inset-0 rounded-2xl blur-sm opacity-60 group-hover:opacity-100 transition-opacity"
        style={{
          background: `radial-gradient(circle at center, transparent 60%, ${color} 100%)`,
        }}
      />

      {/* Contenido interior protegido */}
      <div className="relative z-10 w-full h-full rounded-2xl">
        {children}
      </div>
    </div>
  );
};
