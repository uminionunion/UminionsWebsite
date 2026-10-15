import React, { useEffect, useState } from 'react';
import { preloadProductImage } from '../lib/product-image-cache';

type ProductQueuedImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src: string;
  queue: 'union' | 'users';
};

const ProductQueuedImage: React.FC<ProductQueuedImageProps> = ({ src, queue, alt, className, ...imageProps }) => {
  const [readySrc, setReadySrc] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setLoadFailed(false);
    preloadProductImage(src, queue)
      .then(() => {
        if (active) setReadySrc(src);
      })
      .catch(() => {
        if (active) {
          setReadySrc(null);
          setLoadFailed(true);
        }
      });
    return () => { active = false; };
  }, [queue, src]);

  if (readySrc) return <img {...imageProps} alt={alt} className={className} src={readySrc} />;
  if (loadFailed) return <div role="img" aria-label={`${alt || 'Product'} image unavailable`} className={className} />;
  return null;
};

export default ProductQueuedImage;
