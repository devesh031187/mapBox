import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  subtitle?: ReactNode;
  footer?: ReactNode;
}

export function Card({
  title,
  subtitle,
  footer,
  className = '',
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}
      {...rest}
    >
      {(title || subtitle) && (
        <div className="border-b border-slate-100 px-5 py-4">
          {title && (
            <h3 className="text-sm font-semibold text-slate-800">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
      )}
      <div className="px-5 py-4">{children}</div>
      {footer && (
        <div className="border-t border-slate-100 px-5 py-3">
          {footer}
        </div>
      )}
    </div>
  );
}
