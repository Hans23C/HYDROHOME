import React, { useMemo } from 'react';
import { Particles, ParticlesProvider } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

/**
 * ParticulasAgua
 * Componente de partículas acuáticas interactivo y optimizado para Hydro Home.
 * Reacciona a toques y gestos en pantalla (dispersión y generación de gotas/burbujas).
 */
export const ParticulasAgua = ({ className = 'absolute inset-0 pointer-events-auto z-0' }) => {
  // Configuración de tsParticles optimizada para dispositivos móviles y temática acuática
  const options = useMemo(() => ({
    fullScreen: { enable: false },
    fpsLimit: 60,
    detectRetina: true,
    background: {
      color: { value: 'transparent' },
    },
    particles: {
      number: {
        value: 36,
        density: {
          enable: true,
          width: 500,
          height: 800,
        },
      },
      color: {
        value: ['#38BDF8', '#06B6D4', '#67E8F9', '#E0F2FE'],
      },
      shape: {
        type: 'circle',
      },
      opacity: {
        value: { min: 0.25, max: 0.75 },
        animation: {
          enable: true,
          speed: 1.2,
          sync: false,
        },
      },
      size: {
        value: { min: 1.5, max: 4.2 },
        animation: {
          enable: true,
          speed: 1.5,
          sync: false,
        },
      },
      links: {
        enable: true,
        distance: 85,
        color: '#38BDF8',
        opacity: 0.22,
        width: 1,
      },
      move: {
        enable: true,
        speed: 0.85,
        direction: 'none',
        random: true,
        straight: false,
        outModes: {
          default: 'out',
        },
      },
    },
    interactivity: {
      detectsOn: 'window',
      events: {
        // Al tocar la pantalla: salpican nuevas gotas luminosas y se expanden burbujas
        onClick: {
          enable: true,
          mode: ['push', 'bubble'],
        },
        // Al deslizar el dedo o cursor: las partículas se apartan como agua líquida
        onHover: {
          enable: true,
          mode: 'repulse',
          parallax: {
            enable: true,
            force: 25,
            smooth: 10,
          },
        },
        resize: true,
      },
      modes: {
        push: {
          quantity: 4,
        },
        repulse: {
          distance: 90,
          duration: 0.4,
          speed: 1,
        },
        bubble: {
          distance: 140,
          size: 6.5,
          duration: 0.8,
          opacity: 0.85,
        },
      },
    },
  }), []);

  return (
    <div className={className}>
      <ParticlesProvider init={loadSlim}>
        <Particles
          id="hydro-water-particles"
          options={options}
          className="w-full h-full"
        />
      </ParticlesProvider>
    </div>
  );
};

export default ParticulasAgua;
