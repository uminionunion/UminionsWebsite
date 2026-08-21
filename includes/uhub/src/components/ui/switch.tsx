
// Import React and its hooks.
import * as React from 'react';
// Import the Switch component primitives from Radix UI.
import * as SwitchPrimitives from '@radix-ui/react-switch';

// Import the 'cn' utility function for merging class names.
import { cn } from '@/lib/utils';

// Define the Switch component using React.forwardRef to pass refs to the underlying DOM element.
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  // Render the Radix Switch root component.
  <SwitchPrimitives.Root
    className={cn(
      'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
      className,
    )}
    {...props}
    ref={ref}
  >
    {/* The thumb (handle) of the switch that moves left and right. */}
    <SwitchPrimitives.Thumb
      className={cn(
        'pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0',
      )}
    />
  </SwitchPrimitives.Root>
));
// Set the display name for debugging.
Switch.displayName = SwitchPrimitives.Root.displayName;

// Export the Switch component.
export { Switch };
