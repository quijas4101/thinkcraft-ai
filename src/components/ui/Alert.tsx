'use client';

import { cn } from '@/lib/utils';

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  message: string;
  className?: string;
}

export function Alert({ type = 'info', message, className = '' }: AlertProps) {
  const types = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    error: 'bg-red-50 text-red-800 border-red-200'
  };

  return (
    <div className={`p-4 rounded-md border ${types[type]} ${className}`}>
      <p className="text-sm">{message}</p>
    </div>
  );
} 