interface AvatarProps {
  name: string;
  role?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ name, role, size = 'md', className = '' }: AvatarProps) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base'
  };

  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const roleColors = {
    student: 'bg-blue-100 text-blue-800',
    teacher: 'bg-purple-100 text-purple-800',
    admin: 'bg-red-100 text-red-800',
    default: 'bg-gray-100 text-gray-800'
  };

  const colorClass = role ? roleColors[role as keyof typeof roleColors] : roleColors.default;

  return (
    <div
      className={`
        inline-flex items-center justify-center rounded-full
        ${sizes[size]}
        ${colorClass}
        ${className}
      `}
    >
      {initials}
    </div>
  );
} 