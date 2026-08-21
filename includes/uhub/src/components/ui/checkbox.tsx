
// Import React and its hooks.
import * as React from 'react';
// Import the Checkbox component primitives from Radix UI.
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
// Import the 'Check' icon from the lucide-react library.
import { Check } from 'lucide-react';

// Import the 'cn' utility function for merging class names.
import { cn } from '@/lib/utils';

// Define the Checkbox component using React.forwardRef to pass refs to the underlying DOM element.
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  // Render the Radix Checkbox primitive.
  <CheckboxPrimitive.Root
    ref={ref}
    // Use the 'cn' utility to merge default styles with any additional classes passed in 'className'.
    className={cn(
      'peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
      className,
    )}
    {...props}
  >
    {/* The indicator part of the checkbox, which shows the checkmark when checked. */}
    <CheckboxPrimitive.Indicator
      className={cn('flex items-center justify-center text-current')}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
// Set the display name for the component, which is useful for debugging.
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

// Export the Checkbox component.
export { Checkbox };
