import React, { useRef } from 'react';
import { useSpring, animated } from '@react-spring/web';

const calcTilt = (x, y, rect) => [
  -(y - rect.top - rect.height / 2) / 12,
  (x - rect.left - rect.width / 2) / 12,
  1.02,
];

const transTilt = (x, y, s) =>
  `perspective(600px) rotateX(${x}deg) rotateY(${y}deg) scale(${s})`;

/**
 * TarjetaInclinacion
 * Componente que aplica física de resorte 3D elástica al pasar el cursor o interactuar.
 */
export const TarjetaInclinacion = ({ children, className = '', enabled = true, ...props }) => {
  const cardRef = useRef(null);

  const [springProps, setSpring] = useSpring(() => ({
    xys: [0, 0, 1],
    config: { mass: 1, tension: 280, friction: 20 },
  }));

  if (!enabled) {
    return <div className={className} {...props}>{children}</div>;
  }

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setSpring.start({ xys: calcTilt(e.clientX, e.clientY, rect) });
  };

  const handleMouseLeave = () => {
    setSpring.start({ xys: [0, 0, 1] });
  };

  return (
    <animated.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: springProps.xys.to(transTilt),
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
      className={`transition-shadow duration-300 ${className}`}
      {...props}
    >
      {children}
    </animated.div>
  );
};

export default TarjetaInclinacion;
