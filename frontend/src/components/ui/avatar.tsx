import Image from 'next/image';
import { cn } from '@/lib/utils';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: AvatarSize;
  className?: string;
}

const sizeStyles: Record<AvatarSize, { container: string; image: string }> = {
  sm: { container: 'w-6 h-6 text-xs', image: '24' },
  md: { container: 'w-8 h-8 text-sm', image: '32' },
  lg: { container: 'w-10 h-10 text-base', image: '40' },
  xl: { container: 'w-16 h-16 text-xl', image: '64' },
};

// 이름 기반 배경색 생성 (일관된 색상)
function getAvatarColor(name: string): string {
  const colors = [
    'bg-red-100 text-red-700',
    'bg-orange-100 text-orange-700',
    'bg-amber-100 text-amber-700',
    'bg-yellow-100 text-yellow-700',
    'bg-lime-100 text-lime-700',
    'bg-green-100 text-green-700',
    'bg-emerald-100 text-emerald-700',
    'bg-teal-100 text-teal-700',
    'bg-cyan-100 text-cyan-700',
    'bg-sky-100 text-sky-700',
    'bg-blue-100 text-blue-700',
    'bg-indigo-100 text-indigo-700',
    'bg-violet-100 text-violet-700',
    'bg-purple-100 text-purple-700',
    'bg-fuchsia-100 text-fuchsia-700',
    'bg-pink-100 text-pink-700',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index] as string;
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const initial = name[0]?.toUpperCase() || '?';
  const sizeConfig = sizeStyles[size];

  if (src) {
    return (
      <div
        className={cn(
          'relative rounded-full overflow-hidden shrink-0',
          sizeConfig.container,
          className
        )}
      >
        <Image
          src={src}
          alt={name}
          fill
          sizes={`${sizeConfig.image}px`}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center shrink-0 font-medium',
        sizeConfig.container,
        getAvatarColor(name),
        className
      )}
    >
      <span>{initial}</span>
    </div>
  );
}
