import React, { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';

interface HostelImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const HostelImage: React.FC<HostelImageProps> = ({ src, alt, className = '' }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#14532D]/10 via-slate-100 to-[#D97706]/10 text-[#14532D] ${className}`}
        role="img"
        aria-label={alt}
      >
        <Building2 className="h-8 w-8 opacity-75" strokeWidth={1.5} />
        <span className="mt-2 px-3 text-center text-xs font-medium text-slate-600 line-clamp-1">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
};
