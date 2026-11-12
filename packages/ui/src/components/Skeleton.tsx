import { cn } from '../utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'heading' | 'avatar' | 'button' | 'card' | 'custom';
  style?: React.CSSProperties;
}

const variantClass: Record<string, string> = {
  text: 'h-3 w-full',
  heading: 'h-5 w-2/5',
  avatar: 'w-9 h-9',
  button: 'h-8 w-24',
  card: 'h-40 w-full',
  custom: '',
};

export function Skeleton({ className, variant = 'custom', style }: SkeletonProps) {
  return (
    <span
      className={cn('skeleton', variantClass[variant], className)}
      style={{ borderRadius: 0, ...style }}
      aria-hidden="true"
    />
  );
}