import * as React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

type ButtonBaseProps = React.ComponentProps<typeof motion.button>;
interface ButtonProps extends ButtonBaseProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', fullWidth, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.08 }}
        className={cn(
          "touch-target rounded-md font-medium text-[15px] transition-colors",
          "px-4 py-2",
          variant === 'primary' && "bg-primary text-white hover:bg-primary-dark",
          variant === 'secondary' && "bg-surface border border-border text-text-primary hover:bg-border/50",
          variant === 'outline' && "border-2 border-primary text-primary hover:bg-primary-light",
          variant === 'ghost' && "bg-transparent text-text-muted hover:text-text-primary",
          fullWidth && "w-full",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
