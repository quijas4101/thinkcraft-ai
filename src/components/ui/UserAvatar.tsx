import { User } from '@/types/user';

interface UserAvatarProps {
  user: User | null;
}

export function UserAvatar({ user }: UserAvatarProps) {
  if (!user) return null;

  if (user.photoURL) {
    return (
      <img
        src={user.photoURL}
        alt={user.displayName || 'User avatar'}
        className="h-8 w-8 rounded-full"
      />
    );
  }

  return (
    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
      <span className="text-primary-700 font-medium text-sm">
        {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
      </span>
    </div>
  );
} 