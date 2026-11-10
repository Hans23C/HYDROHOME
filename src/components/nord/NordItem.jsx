import React from 'react';

export const ItemGroup = React.forwardRef(({ children, className = '', ...props }, ref) => (
  <div ref={ref} className={`space-y-2.5 ${className}`} role="list" {...props}>
    {children}
  </div>
));
ItemGroup.displayName = 'ItemGroup';

export const Item = ({
  children,
  onClick,
  active = false,
  className = '',
  ...props
}) => {
  const isClickable = !!onClick;
  return (
    <div
      role={isClickable ? 'button' : 'listitem'}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick(e);
        }
      }}
      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border transition-all duration-200 ${
        active
          ? 'bg-cyan-500/10 dark:bg-cyan-950/30 border-cyan-500/50 shadow-md shadow-cyan-500/10'
          : 'bg-white dark:bg-slate-900/70 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700/80'
      } ${isClickable ? 'cursor-pointer select-none active:scale-[0.99]' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const ItemMedia = ({ children, className = '', ...props }) => (
  <div className={`shrink-0 flex items-center justify-center mr-3 ${className}`} {...props}>
    {children}
  </div>
);

export const ItemContent = ({ children, className = '', ...props }) => (
  <div className={`flex-1 min-w-0 pr-2 ${className}`} {...props}>
    {children}
  </div>
);

export const ItemHeader = ({ children, className = '', ...props }) => (
  <div className={`flex items-center gap-2 mb-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 ${className}`} {...props}>
    {children}
  </div>
);

export const ItemTitle = ({ children, className = '', ...props }) => (
  <h4 className={`text-sm font-semibold text-slate-900 dark:text-white truncate ${className}`} {...props}>
    {children}
  </h4>
);

export const ItemDescription = ({ children, className = '', ...props }) => (
  <p className={`text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed ${className}`} {...props}>
    {children}
  </p>
);

export const ItemActions = ({ children, className = '', ...props }) => (
  <div className={`shrink-0 flex items-center gap-2 mt-2 sm:mt-0 ${className}`} {...props}>
    {children}
  </div>
);

export const ItemFooter = ({ children, className = '', ...props }) => (
  <div className={`w-full mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);

export const ItemSeparator = ({ className = '', ...props }) => (
  <div className={`my-2 border-b border-slate-200 dark:border-slate-800/80 ${className}`} role="separator" {...props} />
);

export default {
  Item,
  ItemGroup,
  ItemMedia,
  ItemContent,
  ItemHeader,
  ItemTitle,
  ItemDescription,
  ItemActions,
  ItemFooter,
  ItemSeparator,
};
