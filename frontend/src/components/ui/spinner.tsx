import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const sizeStyles: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <Loader2
      className={cn('animate-spin text-muted-foreground', sizeStyles[size], className)}
    />
  );
}

interface LoadingProps {
  size?: SpinnerSize;
  text?: string;
  className?: string;
}

export function Loading({ size = 'lg', text, className }: LoadingProps) {
  return (
    <div className={cn('flex items-center justify-center py-8', className)}>
      <div className="flex flex-col items-center gap-3">
        <Spinner size={size} />
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
      </div>
    </div>
  );
}
