
// This directive tells some frameworks (like Next.js) that this is a client-side component.
'use client';

// Import React and its hooks.
import * as React from 'react';
// Import the Dialog component primitives from Radix UI.
import * as DialogPrimitive from '@radix-ui/react-dialog';
// Import the 'X' icon from lucide-react for the close button.
import { X } from 'lucide-react';

// Import the 'cn' utility function for merging class names.
import { cn } from '@/lib/utils';

// The main Dialog container component from Radix.
const Dialog = DialogPrimitive.Root;

// The trigger component that opens the dialog.
const DialogTrigger = DialogPrimitive.Trigger;

// A component that portals its children to the end of document.body.
const DialogPortal = DialogPrimitive.Portal;

// A component to close the dialog.
const DialogClose = DialogPrimitive.Close;

// The overlay component that covers the screen behind the dialog.
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
    style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', zIndex: 2147483646, ...props.style }}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

// The main content of the dialog.
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  // Tailwind classes here are scoped to ".uhub-root"; without this, Radix's
  // default document.body portal target escapes that scope and the dialog renders unstyled/invisible.
  const uhubRootContainer =
    typeof document !== 'undefined' ? (document.querySelector('.uhub-root') as HTMLElement | null) : null;

  return (
    <DialogPortal container={uhubRootContainer ?? undefined}>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed left-[50%] top-[50%] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-black text-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
          className,
        )}
        {...props}
        style={{ zIndex: 2147483647, backgroundColor: '#000000', color: '#ffffff', position: 'fixed', ...props.style }}
      >
        {children}
        <DialogPrimitive.Close
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          style={{ background: 'transparent', border: 'none', padding: 0, color: '#ffffff', cursor: 'pointer' }}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

// A header section for the dialog.
const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';

// A footer section for the dialog.
const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

// The title of the dialog.
const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

// The description text of the dialog.
const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

// Export all the Dialog components.
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
