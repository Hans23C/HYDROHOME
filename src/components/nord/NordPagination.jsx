import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { NordVisuallyHidden } from './NordVisuallyHidden';

export const Pagination = ({ className = '', ...props }) => (
  <nav
    role="navigation"
    aria-label="Paginación"
    className={`mx-auto flex w-full justify-center ${className}`}
    {...props}
  />
);

export const PaginationContent = ({ className = '', ...props }) => (
  <ul className={`flex flex-row items-center gap-1.5 ${className}`} {...props} />
);

export const PaginationItem = ({ className = '', ...props }) => (
  <li className={`${className}`} {...props} />
);

export const PaginationLink = ({
  isActive = false,
  disabled = false,
  children,
  className = '',
  ...props
}) => (
  <button
    type="button"
    aria-current={isActive ? 'page' : undefined}
    disabled={disabled}
    className={`min-w-[34px] h-[34px] px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
      disabled
        ? 'opacity-40 cursor-not-allowed text-slate-500'
        : isActive
        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
        : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700'
    } ${className}`}
    {...props}
  >
    {children}
  </button>
);

export const PaginationPrevious = ({ disabled = false, onClick, className = '', ...props }) => (
  <PaginationLink
    aria-label="Página anterior"
    disabled={disabled}
    onClick={onClick}
    className={`gap-1 px-3 ${className}`}
    {...props}
  >
    <ChevronLeft className="w-4 h-4" />
    <span className="hidden sm:inline">Anterior</span>
  </PaginationLink>
);

export const PaginationNext = ({ disabled = false, onClick, className = '', ...props }) => (
  <PaginationLink
    aria-label="Página siguiente"
    disabled={disabled}
    onClick={onClick}
    className={`gap-1 px-3 ${className}`}
    {...props}
  >
    <span className="hidden sm:inline">Siguiente</span>
    <ChevronRight className="w-4 h-4" />
  </PaginationLink>
);

export const PaginationEllipsis = ({ className = '', ...props }) => (
  <span
    aria-hidden
    className={`flex h-9 w-9 items-center justify-center text-slate-500 ${className}`}
    {...props}
  >
    <MoreHorizontal className="w-4 h-4" />
    <NordVisuallyHidden>Más páginas</NordVisuallyHidden>
  </span>
);

export default {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
