import React, { useRef } from 'react';
import anime from 'animejs';

/**
 * WaterRippleButton
 * Botón con efecto de onda hídrica expansiva (Water Ripple) impulsada por Anime.js.
 */
export const WaterRippleButton = ({
  children,
  onClick,
  className = '',
  rippleColor = 'rgba(56, 189, 248, 0.45)',
  ...props
}) => {
  const buttonRef = useRef(null);

  const handleClick = (e) => {
    const button = buttonRef.current;
    if (!button) {
      onClick?.(e);
      return;
    }

    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Crear elemento de onda
    const ripple = document.createElement('span');
    ripple.style.position = 'absolute';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = '10px';
    ripple.style.height = '10px';
    ripple.style.borderRadius = '50%';
    ripple.style.transform = 'translate(-50%, -50%) scale(0)';
    ripple.style.backgroundColor = rippleColor;
    ripple.style.pointerEvents = 'none';
    ripple.style.zIndex = '10';

    button.appendChild(ripple);

    // Animación física de onda con Anime.js
    const maxDim = Math.max(rect.width, rect.height) * 2.2;

    anime({
      targets: ripple,
      scale: [0, maxDim / 10],
      opacity: [0.75, 0],
      duration: 650,
      easing: 'easeOutCubic',
      complete: () => {
        ripple.remove();
      },
    });

    onClick?.(e);
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default WaterRippleButton;
