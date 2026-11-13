import React, { useState } from 'react';
import { User } from 'lucide-react';
import { useAuth, getDicebearAvatarUrl } from '../../context/AuthContext';

export const AvatarUsuario = ({
  size = 'md',
  className = '',
  onClick,
  showStatus = false,
  statusOnline = true,
}) => {
  const { user } = useAuth();
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-full',
    md: 'w-10 h-10 rounded-full',
    lg: 'w-12 h-12 rounded-2xl',
    xl: 'w-24 h-24 rounded-[28px]',
    '2xl': 'w-28 h-28 rounded-[32px]',
  };

  const avatarUrl =
    user?.avatarUrl ||
    getDicebearAvatarUrl(
      user?.avatarStyle || 'clay',
      user?.avatarSeed || user?.firstName || 'Hannah'
    );

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center shrink-0 select-none overflow-hidden ${
        onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''
      } ${sizeClasses[size] || sizeClasses.md} bg-gradient-to-br from-[#07131F] via-[#0E1A29] to-[#00C2FF]/30 border border-slate-700/60 shadow-sm ${className}`}
    >
      {!imageError && avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Avatar de usuario"
          className="w-full h-full object-cover object-center filter contrast-105"
          onError={() => setImageError(true)}
        />
      ) : (
        <User className="w-1/2 h-1/2 text-slate-300" />
      )}

      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-[#1E2022] ${
            statusOnline ? 'bg-emerald-500' : 'bg-slate-400'
          }`}
        />
      )}
    </div>
  );
};

export default AvatarUsuario;
