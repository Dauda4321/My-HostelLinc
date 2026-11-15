import React from 'react';
import { Phone, ShieldCheck } from 'lucide-react';
import { Hostel } from '../types/hostel';
import { ModalShell } from './ModalShell';
import { CategorizedGallery } from './CategorizedGallery';

interface HostelGalleryModalProps {
  hostel: Hostel | null;
  stats?: {
    totalRooms: number;
    availableRooms: number;
    totalBeds: number;
    availableBeds: number;
  };
  onClose: () => void;
  onFilterToHostelRooms: (hostelId: string) => void;
}

export const HostelGalleryModal: React.FC<HostelGalleryModalProps> = ({
  hostel,
  stats,
  onClose,
  onFilterToHostelRooms,
}) => {
  if (!hostel) return null;

  return (
    <ModalShell
      isOpen={Boolean(hostel)}
      onClose={onClose}
      title={hostel.name}
      subtitle={`${hostel.campus} Campus · Managed by ${hostel.ownerName}`}
      titleId="hostel-gallery-title"
      maxWidthClass="max-w-4xl"
      footerExtra={
        <button
          type="button"
          onClick={() => {
            onFilterToHostelRooms(hostel.id);
            onClose();
          }}
          className="min-h-[40px] rounded-lg bg-[#14532D] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#166534]"
        >
          Browse Rooms in This Hostel
        </button>
      }
    >
      <div className="p-6 space-y-6">
        {/* Summary & Contact Strip */}
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
          <div>
            <div className="text-xs text-slate-500">Availability</div>
            <div className="mt-1 font-mono text-sm font-bold text-[#14532D] tabular-nums">
              {stats ? `${stats.availableRooms} of ${stats.totalRooms} rooms open` : 'Active'}
            </div>
            {stats && (
              <div className="font-mono text-xs font-semibold text-[#B45309] tabular-nums">
                {stats.availableBeds} bed spaces left
              </div>
            )}
          </div>
          <div>
            <div className="text-xs text-slate-500">Campus &amp; Owner</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">
              {hostel.campus} Campus
            </div>
            <div className="text-xs text-slate-600">{hostel.ownerName}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Hostel Contact</div>
            <div className="mt-1 inline-flex items-center gap-1.5 font-mono text-sm font-semibold text-slate-900 tabular-nums">
              <Phone className="h-3.5 w-3.5 text-[#14532D]" />
              <span>{hostel.contactPhone}</span>
            </div>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-slate-600">{hostel.description}</p>

        {/* Categorized Photo Gallery */}
        <div className="space-y-2.5">
          <h3 className="font-display text-base font-bold text-slate-900">
            Hostel Photo Gallery
          </h3>
          <p className="text-xs text-slate-500">
            Click any photo to enlarge and browse Rooms, Utilities &amp; Facilities, and Kitchen spaces.
          </p>
          <CategorizedGallery photos={hostel.photos ?? []} />
        </div>

        {/* Tenancy Rules */}
        <div className="space-y-2.5 border-t border-slate-200 pt-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ShieldCheck className="h-4 w-4 text-[#14532D]" />
            <span>Hostel Rules &amp; Tenancy Terms</span>
          </div>
          <ul className="space-y-1.5 text-xs leading-relaxed text-slate-600 list-disc pl-4">
            {hostel.rules.map((rule, idx) => (
              <li key={idx}>{rule}</li>
            ))}
          </ul>
        </div>
      </div>
    </ModalShell>
  );
};
