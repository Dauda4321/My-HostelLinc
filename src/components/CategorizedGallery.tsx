import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, Image as ImageIcon, X } from 'lucide-react';
import { HostelPhoto, PhotoCategory } from '../types/hostel';
import { HostelImage } from './HostelImage';

export type GalleryFilterTab = 'all' | PhotoCategory;

interface CategorizedGalleryProps {
  photos: HostelPhoto[];
  compact?: boolean;
  defaultTab?: GalleryFilterTab;
}

const CATEGORY_TABS: Array<{ id: GalleryFilterTab; label: string }> = [
  { id: 'all', label: 'All Photos' },
  { id: 'room', label: 'Rooms' },
  { id: 'utilities', label: 'Utilities & Facilities' },
  { id: 'kitchen', label: 'Kitchen' },
];

export function formatPhotoCategoryLabel(category: PhotoCategory): string {
  if (category === 'room') return 'Room';
  if (category === 'utilities') return 'Utilities & Facilities';
  return 'Kitchen';
}

export const CategorizedGallery: React.FC<CategorizedGalleryProps> = ({
  photos,
  compact = false,
  defaultTab = 'all',
}) => {
  const [activeTab, setActiveTab] = useState<GalleryFilterTab>(defaultTab);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string>(photos[0]?.id ?? '');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const counts = useMemo(() => {
    return {
      all: photos.length,
      room: photos.filter((p) => p.category === 'room').length,
      utilities: photos.filter((p) => p.category === 'utilities').length,
      kitchen: photos.filter((p) => p.category === 'kitchen').length,
    };
  }, [photos]);

  const filteredPhotos = useMemo(() => {
    if (activeTab === 'all') return photos;
    return photos.filter((p) => p.category === activeTab);
  }, [photos, activeTab]);

  useEffect(() => {
    if (filteredPhotos.length > 0) {
      const stillVisible = filteredPhotos.some((p) => p.id === selectedPhotoId);
      if (!stillVisible) {
        setSelectedPhotoId(filteredPhotos[0].id);
      }
    }
  }, [filteredPhotos, selectedPhotoId]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev === null || filteredPhotos.length === 0
            ? null
            : (prev + 1) % filteredPhotos.length
        );
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev === null || filteredPhotos.length === 0
            ? null
            : (prev - 1 + filteredPhotos.length) % filteredPhotos.length
        );
      }
    };
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [lightboxIndex, filteredPhotos.length]);

  const activeStagePhoto =
    filteredPhotos.find((p) => p.id === selectedPhotoId) ?? filteredPhotos[0] ?? null;

  const lightboxPhoto =
    lightboxIndex !== null && filteredPhotos[lightboxIndex]
      ? filteredPhotos[lightboxIndex]
      : null;

  if (photos.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
        <ImageIcon className="mx-auto h-7 w-7 text-slate-400" strokeWidth={1.5} />
        <p className="mt-2 text-xs font-medium text-slate-600">
          No photos have been uploaded for this property yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div
        role="tablist"
        aria-label="Photo gallery categories"
        className="flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 p-1"
      >
        {CATEGORY_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = counts[tab.id];
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-[34px] rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-[#14532D] text-white'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {filteredPhotos.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
          No photos uploaded under this category yet.
        </div>
      ) : compact ? (
        /* Compact Mode for Room Details Modal: Active Preview Stage + Clickable Thumbnail Strip */
        <div className="space-y-3">
          {activeStagePhoto && (
            <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
              <button
                type="button"
                onClick={() => {
                  const idx = filteredPhotos.findIndex((p) => p.id === activeStagePhoto.id);
                  setLightboxIndex(idx >= 0 ? idx : 0);
                }}
                className="group relative block w-full text-left focus-visible:outline-2 focus-visible:outline-[#14532D]"
              >
                <HostelImage
                  src={activeStagePhoto.url}
                  alt={activeStagePhoto.caption}
                  className="h-52 w-full object-cover transition-transform duration-200 group-hover:scale-[1.01]"
                />
                <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-3.5 py-2.5">
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold text-[#B45309]">
                      {formatPhotoCategoryLabel(activeStagePhoto.category)}
                    </div>
                    <div className="truncate text-xs font-medium text-slate-800">
                      {activeStagePhoto.caption}
                    </div>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 group-hover:bg-slate-100">
                    <Expand className="h-3 w-3" />
                    <span>Enlarge</span>
                  </span>
                </div>
              </button>
            </div>
          )}

          {/* Thumbnail Strip */}
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {filteredPhotos.map((photo, idx) => {
              const isSelected = activeStagePhoto?.id === photo.id;
              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setSelectedPhotoId(photo.id)}
                  onDoubleClick={() => setLightboxIndex(idx)}
                  title={photo.caption}
                  className={`group overflow-hidden rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'border-[#14532D] ring-2 ring-[#14532D]/25'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <HostelImage
                    src={photo.url}
                    alt={photo.caption}
                    className="h-14 w-full object-cover"
                  />
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Full Gallery Grid for Hostel Overview Modal */
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPhotos.map((photo, idx) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setLightboxIndex(idx)}
              className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-left transition-colors hover:border-[#14532D]"
            >
              <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                <HostelImage
                  src={photo.url}
                  alt={photo.caption}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-md bg-slate-900/75 px-2 py-1 text-[11px] font-semibold text-white opacity-90 transition-opacity group-hover:opacity-100">
                  <Expand className="h-3 w-3" />
                  <span>View</span>
                </span>
              </div>
              <div className="p-3 space-y-1">
                <div className="text-[11px] font-semibold text-[#B45309]">
                  {formatPhotoCategoryLabel(photo.category)}
                  {photo.roomType ? ` · ${photo.roomType}` : ''}
                </div>
                <p className="text-xs font-medium leading-snug text-slate-800 line-clamp-2">
                  {photo.caption}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Interactive Lightbox Overlay */}
      {lightboxPhoto && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/85 p-3 sm:p-6 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged Photo Preview"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setLightboxIndex(null);
            }
          }}
        >
          <div className="relative flex w-full max-w-4xl max-h-[90vh] flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
            {/* Lightbox Top Bar */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-800 px-4 py-3 text-white">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[#F59E0B]">
                  {formatPhotoCategoryLabel(lightboxPhoto.category)}
                  {lightboxPhoto.roomType ? ` · ${lightboxPhoto.roomType}` : ''} · Photo{' '}
                  <span className="font-mono tabular-nums">
                    {lightboxIndex + 1} of {filteredPhotos.length}
                  </span>
                </div>
                <p className="truncate text-sm font-medium text-slate-100">
                  {lightboxPhoto.caption}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                aria-label="Close photo preview"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Lightbox Image Stage */}
            <div className="relative flex flex-1 items-center justify-center bg-black/50 overflow-hidden p-2 sm:p-4">
              <HostelImage
                src={lightboxPhoto.url}
                alt={lightboxPhoto.caption}
                className="max-h-[65vh] w-auto max-w-full rounded-lg object-contain"
              />

              {filteredPhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex(
                        (lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length
                      )
                    }
                    aria-label="Previous photo"
                    className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-slate-900/80 text-white hover:bg-slate-800"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex((lightboxIndex + 1) % filteredPhotos.length)
                    }
                    aria-label="Next photo"
                    className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-slate-900/80 text-white hover:bg-slate-800"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Lightbox Caption Footer */}
            <div className="flex items-center justify-between gap-4 border-t border-slate-800 bg-slate-900 px-4 py-3">
              <p className="text-xs text-slate-300">{lightboxPhoto.caption}</p>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="shrink-0 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
