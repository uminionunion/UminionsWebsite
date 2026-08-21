
// Import React and its hooks.
import * as React from 'react';
// Import the Label component primitives from Radix UI.
import * as LabelPrimitive from '@radix-ui/react-label';
// Import 'cva' for creating variant-driven component styles, and 'VariantProps' for type inference.
import { cva, type VariantProps } from 'class-variance-authority';

// Import the 'cn' utility function for merging class names.
import { cn } from '@/lib/utils';

// Define variants for the label component using 'cva'.
const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
);

// Define the Label component using React.forwardRef to pass refs to the underlying DOM element.
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  // Render the Radix Label primitive.
  <LabelPrimitive.Root
    ref={ref}
    // Use the 'cn' utility to merge the base variant classes with any additional classes.
    className={cn(labelVariants(), className)}
    {...props}
  />
));
// Set the display name for the component, which is useful for debugging.
Label.displayName = LabelPrimitive.Root.displayName;

// Export the Label component.
export { Label };
