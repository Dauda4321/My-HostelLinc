import React, { useState } from 'react';
import { ImagePlus, Link2, Trash2, Upload } from 'lucide-react';
import { HostelPhoto, PhotoCategory } from '../types/hostel';
import { HostelImage } from './HostelImage';
import { formatPhotoCategoryLabel } from './CategorizedGallery';

interface PhotoManagerProps {
  photos: HostelPhoto[];
  onChange: (nextPhotos: HostelPhoto[]) => void;
  compact?: boolean;
}

function readFileAsCompressedDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const result = reader.result as string;
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 960;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width >= height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(result);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.78));
        } catch {
          resolve(result);
        }
      };
      img.onerror = () => resolve(result);
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}

export const PhotoManager: React.FC<PhotoManagerProps> = ({
  photos,
  onChange,
  compact = false,
}) => {
  const [category, setCategory] = useState<PhotoCategory>('room');
  const [caption, setCaption] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const defaultCaptionForCategory = (cat: PhotoCategory, fileName?: string) => {
    const cleanName = fileName ? fileName.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ') : '';
    if (cleanName) return `${formatPhotoCategoryLabel(cat)} — ${cleanName}`;
    if (cat === 'room') return 'Student Room Interior — Furnished beds & study area';
    if (cat === 'utilities') return 'Hostel Utilities — Washroom, water tanks & prepaid meter';
    return 'Shared Student Kitchen — Countertop, sink & cooking area';
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setError(null);
    setUploading(true);

    try {
      const added: HostelPhoto[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          setError('Please select valid image files (JPG, PNG, WebP).');
          continue;
        }
        const dataUrl = await readFileAsCompressedDataUrl(file);
        added.push({
          id: `photo-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          category,
          url: dataUrl,
          caption: caption.trim() || defaultCaptionForCategory(category, file.name),
        });
      }
      if (added.length > 0) {
        onChange([...photos, ...added]);
        setCaption('');
      }
    } catch {
      setError('Could not process one or more selected image files.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleAddByUrl = () => {
    setError(null);
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setError('Please paste an image URL first.');
      return;
    }

    const newPhoto: HostelPhoto = {
      id: `photo-url-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      category,
      url: trimmed,
      caption: caption.trim() || defaultCaptionForCategory(category),
    };

    onChange([...photos, newPhoto]);
    setUrlInput('');
    setCaption('');
  };

  const handleRemovePhoto = (id: string) => {
    onChange(photos.filter((p) => p.id !== id));
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ImagePlus className="h-4 w-4 text-[#14532D]" />
          <span className="text-xs font-bold text-slate-900">
            Categorized Hostel &amp; Room Photos ({photos.length})
          </span>
        </div>
        <span className="text-[11px] text-slate-500">
          Upload from device or paste image URL
        </span>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-800">
          {error}
        </div>
      )}

      {/* Category & Caption Inputs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700">Photo Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as PhotoCategory)}
            className="mt-1 block w-full min-h-[38px] rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-900"
          >
            <option value="room">Room</option>
            <option value="utilities">Utilities (Washroom / Water / Meter)</option>
            <option value="kitchen">Kitchen</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700">
            Photo Caption (Optional)
          </label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="e.g. Shared Student Kitchen — Ground Floor Block A"
            className="mt-1 block w-full min-h-[38px] rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Upload from Device OR Paste Image URL */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex min-h-[40px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#14532D]/50 bg-white px-3 py-2 text-xs font-semibold text-[#14532D] transition-colors hover:bg-[#14532D]/5">
          <Upload className="h-4 w-4 shrink-0" />
          <span>{uploading ? 'Processing Image...' : 'Upload Photo(s) from Device'}</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="sr-only"
          />
        </label>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Link2 className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste image URL..."
              className="block w-full min-h-[40px] rounded-lg border border-slate-300 bg-white pl-8 pr-2.5 text-xs text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <button
            type="button"
            onClick={handleAddByUrl}
            className="min-h-[40px] shrink-0 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Add URL
          </button>
        </div>
      </div>

      {/* Existing Photos Grid */}
      {photos.length > 0 && (
        <div
          className={`grid gap-2.5 ${
            compact ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
          }`}
        >
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white"
            >
              <HostelImage
                src={photo.url}
                alt={photo.caption}
                className="h-24 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemovePhoto(photo.id)}
                aria-label={`Remove photo ${photo.caption}`}
                className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-900/75 text-white hover:bg-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <div className="p-2">
                <div className="text-[10px] font-semibold text-[#B45309]">
                  {formatPhotoCategoryLabel(photo.category)}
                </div>
                <div className="truncate text-[11px] font-medium text-slate-700">
                  {photo.caption}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
