import React, { useEffect } from 'react';
import { ArrowLeft, X } from 'lucide-react';

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: React.ReactNode;
  titleId?: string;
  maxWidthClass?: string;
  headerActions?: React.ReactNode;
  subHeader?: React.ReactNode;
  footerExtra?: React.ReactNode;
  children: React.ReactNode;
}

export const ModalShell: React.FC<ModalShellProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  titleId,
  maxWidthClass = 'max-w-lg',
  headerActions,
  subHeader,
  footerExtra,
  children,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-3 sm:p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`relative w-full ${maxWidthClass} max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl`}
      >
        {/* Sticky Top Header */}
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white no-print">
          <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 whitespace-nowrap"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back / Close</span>
              </button>
              <div className="min-w-0">
                {subtitle && (
                  <div className="truncate text-[11px] font-semibold text-[#B45309]">
                    {subtitle}
                  </div>
                )}
                <h2
                  id={titleId}
                  className="truncate font-display text-base sm:text-lg font-bold text-slate-900"
                >
                  {title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {headerActions}
              <button
                type="button"
                onClick={onClose}
                aria-label={`Close ${title}`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          {subHeader}
        </div>

        {/* Scrollable Content Body */}
        <div>{children}</div>

        {/* Sticky Bottom Footer with Prominent Close Button */}
        <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:px-6 no-print">
          <div className="flex items-center gap-2">{footerExtra}</div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] rounded-lg border border-slate-300 bg-white px-5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
