import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { NordToast } from './NordToast';

export const NordToastGroup = ({ position = 'top-right' }) => {
  const { toasts, removeToast } = useAuth();

  if (!toasts || toasts.length === 0) return null;

  const positionClasses = {
    'top-right': 'top-5 right-4 sm:right-6 items-end',
    'top-center': 'top-5 left-1/2 -translate-x-1/2 items-center',
    'bottom-right': 'bottom-5 right-4 sm:right-6 items-end',
    'bottom-center': 'bottom-24 left-1/2 -translate-x-1/2 items-center',
  }[position] || 'top-5 right-4 sm:right-6 items-end';

  return (
    <div
      aria-label="Notificaciones del sistema"
      className={`fixed z-50 pointer-events-none flex flex-col gap-3 max-w-md w-full px-4 ${positionClasses}`}
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <NordToast
            {...toast}
            onDismiss={removeToast}
          />
        </div>
      ))}
    </div>
  );
};

export default NordToastGroup;
