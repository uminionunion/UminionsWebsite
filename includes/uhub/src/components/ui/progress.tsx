
// Import React and its hooks.
import * as React from 'react';
// Import the Progress component primitives from Radix UI.
import * as ProgressPrimitive from '@radix-ui/react-progress';

// Import the 'cn' utility function for merging class names.
import { cn } from '@/lib/utils';

// Define the Progress component using React.forwardRef to pass refs to the underlying DOM element.
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  // Render the Radix Progress root component.
  <ProgressPrimitive.Root
    ref={ref}
    // Use 'cn' to merge default styles with any custom classes.
    className={cn(
      'relative h-2 w-full overflow-hidden rounded-full bg-primary/20',
      className,
    )}
    {...props}
  >
    {/* The indicator part of the progress bar, which shows the current progress. */}
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      // The transform style is used to set the width of the indicator based on the 'value' prop.
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
// Set the display name for debugging.
Progress.displayName = ProgressPrimitive.Root.displayName;

// Export the Progress component.
export { Progress };
