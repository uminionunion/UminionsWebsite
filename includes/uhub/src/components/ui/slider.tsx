
// Import React and its hooks.
import * as React from 'react';
// Import the Slider component primitives from Radix UI.
import * as SliderPrimitive from '@radix-ui/react-slider';

// Import the 'cn' utility function for merging class names.
import { cn } from '@/lib/utils';

// Define the Slider component using React.forwardRef to pass refs to the underlying DOM element.
const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  // Render the Radix Slider root component.
  <SliderPrimitive.Root
    ref={ref}
    // Use 'cn' to merge default styles with any custom classes.
    className={cn(
      'relative flex w-full touch-none select-none items-center',
      className,
    )}
    {...props}
  >
    {/* The track of the slider. */}
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
      {/* The range (filled part) of the slider track. */}
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    {/* The thumb (handle) of the slider. */}
    <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
// Set the display name for debugging.
Slider.displayName = SliderPrimitive.Root.displayName;

// Export the Slider component.
export { Slider };
