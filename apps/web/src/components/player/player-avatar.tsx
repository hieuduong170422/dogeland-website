import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

interface PlayerAvatarProps {
  username: string;
  size?: number;
  className?: string;
}

export function PlayerAvatar({ username, size = 64, className }: PlayerAvatarProps) {
  return (
    <div
      className={cn('relative overflow-hidden rounded-lg bg-muted', className)}
      style={{ width: size, height: size }}
    >
      <Image
        src={`https://mc-heads.net/avatar/${username}/${size}`}
        alt={`${username}'s avatar`}
        width={size}
        height={size}
        className="pixelated"
        unoptimized
      />
    </div>
  );
}
