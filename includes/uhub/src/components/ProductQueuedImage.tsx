import React, { useEffect, useState } from 'react';
import { preloadProductImage } from '../lib/product-image-cache';

type ProductQueuedImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src: string;
  queue: 'union' | 'users';
};

const ProductQueuedImage: React.FC<ProductQueuedImageProps> = ({ src, queue, alt, className, ...imageProps }) => {
  const [readySrc, setReadySrc] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setReadySrc(null);
    setLoadFailed(false);
    preloadProductImage(src, queue)
      .then(() => {
        if (active) setReadySrc(src);
      })
      .catch(error => {
        console.error('[PRODUCT IMAGES] Product thumbnail unavailable:', src, error);
        if (active) {
          setReadySrc(null);
          setLoadFailed(true);
        }
      });
    return () => { active = false; };
  }, [attempt, queue, src]);

  if (readySrc === src) return <img {...imageProps} alt={alt} className={className} src={readySrc} decoding="async" />;
  if (loadFailed) return <button type="button" className={`${className || ''} uhub-product-image-retry`} aria-label={`Retry ${alt || 'product'} image`} title="Image unavailable. Click to retry." onClick={event => { event.stopPropagation(); setAttempt(value => value + 1); }}>Retry</button>;
  return <span role="status" aria-label={`Loading ${alt || 'product'} image`} className={`${className || ''} animate-pulse bg-gray-800`} />;
};

export default ProductQueuedImage;
