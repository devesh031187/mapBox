export interface SpinnerProps {
  size?: number;
  className?: string;
  label?: string;
}

export function Spinner({
  size = 24,
  className = '',
  label = 'Loading',
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-block animate-spin rounded-full border-2 border-brand-600 border-t-transparent ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
