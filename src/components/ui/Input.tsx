import * as React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-sm w-full">
        <label className="text-small text-text-muted font-medium">{label}</label>
        <input
          ref={ref}
          className={cn(
            "touch-target rounded-md border border-border bg-surface px-md py-sm text-[16px] text-text-primary outline-none transition-colors",
            "focus:border-primary focus:ring-2 focus:ring-primary/20",
            error && "border-danger focus:border-danger focus:ring-danger/20",
            className
          )}
          {...props}
        />
        {error && <span className="text-micro text-danger flex items-center gap-1">⚠ {error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
