
"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"
import { IMAGE_LOAD_PRIORITY, preloadQueuedImage } from "@/lib/image-load-queue"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

type AvatarImageProps = React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> & {
  queuePriority?: number;
};

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  AvatarImageProps
>(({ className, src, queuePriority = IMAGE_LOAD_PRIORITY.critical, ...props }, ref) => {
  const [queuedSrc, setQueuedSrc] = React.useState<string>();

  React.useEffect(() => {
    let active = true;
    setQueuedSrc(undefined);
    if (typeof src !== "string" || !src) return () => { active = false; };

    preloadQueuedImage(src, queuePriority)
      .then(() => {
        if (active) setQueuedSrc(src);
      })
      .catch(() => {
        // Keep the Radix fallback visible if a profile image cannot be loaded.
      });

    return () => { active = false; };
  }, [queuePriority, src]);

  return (
  <AvatarPrimitive.Image
      ref={ref}
      src={queuedSrc}
      className={cn("aspect-square h-full w-full", className)}
      {...props}
  />
  );
})
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
