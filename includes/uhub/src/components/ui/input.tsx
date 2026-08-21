
// Import React and its hooks.
import * as React from 'react';

// Import the 'cn' utility function for merging class names.
import { cn } from '@/lib/utils';

// Define the Input component using React.forwardRef to pass refs to the underlying DOM element.
// It accepts standard HTML input props.
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      // Render a standard HTML input element.
      <input
        type={type}
        // Use the 'cn' utility to merge default styles with any additional classes passed in 'className'.
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className,
        )}
        // Forward the ref to the input element.
        ref={ref}
        // Spread any other props to the input element.
        {...props}
      />
    );
  },
);
// Set the display name for the component, which is useful for debugging.
Input.displayName = 'Input';

// Export the Input component.
export { Input };
