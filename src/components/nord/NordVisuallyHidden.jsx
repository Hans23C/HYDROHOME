import React from 'react';

/**
 * NordVisuallyHidden
 * Componente de accesibilidad para ocultar visualmente texto conservándolo
 * disponible para lectores de pantalla y herramientas asistivas.
 */
export const NordVisuallyHidden = ({ children, as: Component = 'span', ...props }) => {
  return (
    <Component
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: '0',
      }}
      {...props}
    >
      {children}
    </Component>
  );
};

export default NordVisuallyHidden;
