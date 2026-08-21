
// Import React and its hooks.
import * as React from 'react';
// Import the Toggle component primitives from Radix UI.
import * as TogglePrimitive from '@radix-ui/react-toggle';
// Import 'cva' for creating variant-driven component styles, and 'VariantProps' for type inference.
import { cva, type VariantProps } from 'class-variance-authority';

// Import the 'cn' utility function for merging class names.
import { cn } from '@/lib/utils';

// Define variants for the toggle component using 'cva'.
// This allows for different styles (e.g., 'default', 'outline') and sizes ('default', 'sm', 'lg').
const toggleVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline:
          'border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-9 px-2 min-w-9',
        sm: 'h-8 px-1.5 min-w-8',
        lg: 'h-10 px-2.5 min-w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

// Define the Toggle component using React.forwardRef to pass refs to the underlying DOM element.
// It combines the props of the Radix Toggle with the variant props defined by 'cva'.
const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  // Render the Radix Toggle primitive.
  <TogglePrimitive.Root
    ref={ref}
    // Use the 'cn' utility to merge the base variant classes with any additional classes passed in 'className'.
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
));

// Set the display name for the component, which is useful for debugging.
Toggle.displayName = TogglePrimitive.Root.displayName;

// Export the Toggle component and its variants.
export { Toggle, toggleVariants };
