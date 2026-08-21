
// Import React and its hooks.
import * as React from 'react';
// Import the Popover component primitives from Radix UI.
import * as PopoverPrimitive from '@radix-ui/react-popover';

// Import the 'cn' utility function for merging class names.
import { cn } from '@/lib/utils';

// The main Popover container component from Radix.
const Popover = PopoverPrimitive.Root;

// The trigger component that opens/closes the popover.
const PopoverTrigger = PopoverPrimitive.Trigger;

// An optional anchor component to position the popover against.
const PopoverAnchor = PopoverPrimitive.Anchor;

// The content part of the popover, which appears when triggered.
const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  // Portal the content to the body to avoid z-index issues.
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      // Use 'cn' to merge default styles with any custom classes.
      className={cn(
        'z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
// Set the display name for debugging.
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

// Export the Popover components.
export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
