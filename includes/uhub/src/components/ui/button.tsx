
// Import React and its hooks.
import * as React from 'react';
// Import the Slot component from Radix UI. It allows merging props onto a child element.
import { Slot } from '@radix-ui/react-slot';
// Import 'cva' for creating variant-driven component styles, and 'VariantProps' for type inference.
import { cva, type VariantProps } from 'class-variance-authority';

// Import the 'cn' utility function for merging class names.
import { cn } from '@/lib/utils';

// Define variants for the button component using 'cva'.
// This allows for different styles (e.g., 'default', 'destructive') and sizes ('default', 'sm', 'lg', 'icon').
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

// Define the props for the Button component.
// It extends standard button attributes and includes the variants from 'cva'.
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  // 'asChild' allows the button to wrap a child component and pass props to it.
  asChild?: boolean;
}

// Define the Button component using React.forwardRef to pass refs to the underlying DOM element.
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // If 'asChild' is true, use the Slot component; otherwise, use a standard 'button'.
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        // Use the 'cn' utility to merge the base variant classes with any additional classes.
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
// Set the display name for the component, which is useful for debugging.
Button.displayName = 'Button';

// Export the Button component and its variants.
export { Button, buttonVariants };
