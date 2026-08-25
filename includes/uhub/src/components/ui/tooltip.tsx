
// Import React and its hooks.
import * as React from 'react';
// Import the Tooltip component primitives from Radix UI.
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

// Import the 'cn' utility function for merging class names.
import { cn } from '@/lib/utils';

// The provider component that supplies context to all tooltips.
const TooltipProvider = TooltipPrimitive.Provider;

// The main Tooltip container component from Radix.
const Tooltip = TooltipPrimitive.Root;

// The trigger component that shows the tooltip on hover/focus.
const TooltipTrigger = TooltipPrimitive.Trigger;

// The content part of the tooltip, which appears when triggered.
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  // Portal the content to the body to avoid z-index issues.
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      // Use 'cn' to merge default styles with any custom classes.
      className={cn(
        'z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
// Set the display name for debugging.
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// Export the Tooltip components.
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
