import React, { useEffect, useRef, useState } from 'react';
import { IMAGE_LOAD_PRIORITY, preloadQueuedImage } from '../lib/image-load-queue';

type QueuedImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src: string;
  queueExempt?: boolean;
  queuePriority?: number;
  fallbackSrc?: string;
  onQueueError?: (error: Error) => void;
};

const QueuedImage: React.FC<QueuedImageProps> = ({
  src,
  queueExempt = false,
  queuePriority = IMAGE_LOAD_PRIORITY.normal,
  fallbackSrc,
  onQueueError,
  className,
  ...imageProps
}) => {
  const [readySrc, setReadySrc] = useState<string | null>(null);
  const [hasLoadError, setHasLoadError] = useState(false);
  const requestVersion = useRef(0);
  const onQueueErrorRef = useRef(onQueueError);
  const isExempt = queueExempt || className?.split(/\s+/).includes('image-queue-exempt');
  onQueueErrorRef.current = onQueueError;

  useEffect(() => {
    const currentVersion = ++requestVersion.current;
    setReadySrc(null);
    setHasLoadError(false);

    if (isExempt) {
      setReadySrc(src);
      return;
    }

    preloadQueuedImage(src, queuePriority)
      .then(() => {
        if (requestVersion.current === currentVersion) setReadySrc(src);
      })
      .catch(async (error: Error) => {
        if (requestVersion.current !== currentVersion) return;
        if (fallbackSrc && fallbackSrc !== src) {
          try {
            await preloadQueuedImage(fallbackSrc, queuePriority);
            if (requestVersion.current === currentVersion) setReadySrc(fallbackSrc);
            return;
          } catch {
            // Report the original error when both the requested image and its fallback fail.
          }
        }
        setHasLoadError(true);
        onQueueErrorRef.current?.(error);
      });
  }, [fallbackSrc, isExempt, queuePriority, src]);

  if (readySrc) return <img {...imageProps} className={className} src={readySrc} />;
  if (hasLoadError) {
    return <div className={className} role="img" aria-label={imageProps.alt || 'Image unavailable'} title="Image unavailable" />;
  }
  return null;
};

export default QueuedImage;
