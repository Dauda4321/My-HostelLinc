import React, { useEffect, useMemo, useState } from 'react';
import { Check, Lock, ShieldCheck } from 'lucide-react';
import { Hostel, HostelPhoto, Room, UserAccount } from '../types/hostel';
import { HOSTEL_IMAGES } from '../data/seedData';
import { formatGhs } from '../utils/storage';
import { ModalShell } from './ModalShell';
import { CategorizedGallery } from './CategorizedGallery';

interface RoomReservationModalProps {
  room: Room | null;
  hostel: Hostel | undefined;
  currentUser: UserAccount | null;
  onClose: () => void;
  onRequireAuth: () => void;
  onSubmitBooking: (payload: {
    roomId: string;
    hostelId: string;
    studentName: string;
    studentId: string;
    studentPhone: string;
    programmeLevel: string;
    acceptedTerms: boolean;
  }) => void;
}

export const RoomReservationModal: React.FC<RoomReservationModalProps> = ({
  room,
  hostel,
  currentUser,
  onClose,
  onRequireAuth,
  onSubmitBooking,
}) => {
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [programmeLevel, setProgrammeLevel] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setStudentName((prev) => prev || currentUser.fullName);
      setStudentId((prev) => prev || currentUser.studentId || '');
      setStudentPhone((prev) => prev || currentUser.phone || '');
    }
  }, [currentUser, room?.id]);

  const combinedPhotos = useMemo<HostelPhoto[]>(() => {
    if (!room || !hostel) return [];
    const roomSpecific = room.photos ?? [];
    const hostelPhotos = hostel.photos ?? [];

    const matchingOccupancyRoomPhotos = hostelPhotos.filter(
      (p) => p.category === 'room' && p.roomType === room.occupancyType
    );
    const otherRoomPhotos = hostelPhotos.filter(
      (p) => p.category === 'room' && p.roomType !== room.occupancyType
    );
    const facilityPhotos = hostelPhotos.filter(
      (p) => p.category === 'utilities' || p.category === 'kitchen'
    );

    const merged = [
      ...roomSpecific,
      ...matchingOccupancyRoomPhotos,
      ...otherRoomPhotos,
      ...facilityPhotos,
    ];

    if (merged.length > 0) return merged;

    return [
      {
        id: `${room.id}-fallback`,
        category: 'room',
        roomType: room.occupancyType,
        url: HOSTEL_IMAGES.roomInterior,
        caption: `${room.roomNumber} (${room.occupancyType}) — Interior view`,
      },
    ];
  }, [room, hostel]);

  if (!room || !hostel) return null;

  const isBookable = room.status === 'Available' && room.availableBeds > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!currentUser) {
      onRequireAuth();
      return;
    }

    if (!isBookable) {
      setFormError('This room has no available bed spaces for reservation.');
      return;
    }
    if (!studentName.trim() || !studentId.trim() || !studentPhone.trim() || !programmeLevel.trim()) {
      setFormError('Please fill in your full name, UDS Student ID, phone number, and programme/level.');
      return;
    }
    if (!acceptedTerms) {
      setFormError('You must check the box to accept the landlord’s tenancy terms before submitting.');
      return;
    }

    onSubmitBooking({
      roomId: room.id,
      hostelId: hostel.id,
      studentName: studentName.trim(),
      studentId: studentId.trim().toUpperCase(),
      studentPhone: studentPhone.trim(),
      programmeLevel: programmeLevel.trim(),
      acceptedTerms,
    });
  };

  return (
    <ModalShell
      isOpen={Boolean(room && hostel)}
      onClose={onClose}
      title={`${room.roomNumber} (${room.occupancyType})`}
      subtitle={`${hostel.name} · ${hostel.campus} Campus`}
      titleId="room-modal-title"
      maxWidthClass="max-w-4xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Categorized Room, Utilities & Kitchen Gallery + Specs + Rules */}
        <div className="border-b border-slate-200 p-6 lg:col-span-7 lg:border-b-0 lg:border-r space-y-6">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-700">
              Inspect Room, Utilities &amp; Kitchen Photos
            </div>
            <CategorizedGallery
              key={room.id}
              photos={combinedPhotos}
              compact
            />
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
            <div>
              <div className="text-xs text-slate-500">Annual Rent</div>
              <div className="mt-0.5 font-mono text-lg font-bold text-[#14532D] tabular-nums">
                {formatGhs(room.annualRentGhs)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Bed Availability</div>
              <div className="mt-0.5 text-sm font-semibold text-slate-900 tabular-nums">
                {room.status === 'Under Maintenance'
                  ? 'Under Maintenance'
                  : room.availableBeds === 0
                  ? 'Full (0 Left)'
                  : `${room.availableBeds} of ${room.totalBeds} Beds Left`}
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="text-xs text-slate-500">Landlord Contact</div>
              <div className="mt-0.5 font-mono text-sm font-medium text-slate-900 tabular-nums">
                {hostel.contactPhone}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Transparent Cost &amp; Utility Breakdown
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">{room.utilityDetails}</p>
            <div className="pt-1">
              <div className="text-xs font-medium text-slate-500">
                Included Room &amp; Compound Amenities
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-700">
                {room.amenities.map((amenity) => (
                  <span key={amenity} className="inline-flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-[#14532D]" />
                    <span>{amenity}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2.5 border-t border-slate-200 pt-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ShieldCheck className="h-4 w-4 text-[#14532D]" />
              <span>Hostel Rules &amp; Tenancy Terms ({hostel.ownerName})</span>
            </div>
            <ul className="space-y-2 text-xs leading-relaxed text-slate-600 list-disc pl-4">
              {hostel.rules.map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Online Reservation Form or Guest Login Gate */}
        <div className="p-6 lg:col-span-5 bg-white">
          <h3 className="font-display text-base font-bold text-slate-900">
            Online Room Reservation
          </h3>
          <p className="mt-1 text-xs text-slate-600">
            Confirms immediately with a printable Booking Reference Slip. No online payment required.
          </p>

          {!isBookable ? (
            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              This room is currently marked as <span className="font-semibold">{room.status}</span> and cannot accept new bed reservations. Please select another available room.
            </div>
          ) : !currentUser ? (
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#14532D]/10 text-[#14532D]">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    Sign In Required to Book
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    Guests can browse all hostels and inspect room availability freely. Log in or create a student account to reserve a bed space in{' '}
                    <span className="font-semibold text-slate-800">{room.roomNumber}</span>.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onRequireAuth}
                className="flex min-h-[44px] w-full items-center justify-center rounded-lg bg-[#14532D] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#166534]"
              >
                Log In or Create Student Account
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-800">
                  {formError}
                </div>
              )}

              <div>
                <label htmlFor="res-name" className="block text-xs font-semibold text-slate-700">
                  Student Full Name
                </label>
                <input
                  id="res-name"
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Ibrahim Fuseini Yakubu"
                  className="mt-1.5 block w-full min-h-[42px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#14532D] focus:outline-none focus:ring-2 focus:ring-[#14532D]/15"
                />
              </div>

              <div>
                <label htmlFor="res-id" className="block text-xs font-semibold text-slate-700">
                  UDS Student ID
                </label>
                <input
                  id="res-id"
                  type="text"
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. UDS/MD/0412/25"
                  className="mt-1.5 block w-full min-h-[42px] rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 placeholder:font-sans placeholder:text-slate-400 focus:border-[#14532D] focus:outline-none focus:ring-2 focus:ring-[#14532D]/15"
                />
              </div>

              <div>
                <label htmlFor="res-phone" className="block text-xs font-semibold text-slate-700">
                  Phone Number
                </label>
                <input
                  id="res-phone"
                  type="tel"
                  required
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  placeholder="e.g. 024 555 0192"
                  className="mt-1.5 block w-full min-h-[42px] rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 placeholder:font-sans placeholder:text-slate-400 focus:border-[#14532D] focus:outline-none focus:ring-2 focus:ring-[#14532D]/15"
                />
              </div>

              <div>
                <label htmlFor="res-prog" className="block text-xs font-semibold text-slate-700">
                  Programme / Level
                </label>
                <input
                  id="res-prog"
                  type="text"
                  required
                  value={programmeLevel}
                  onChange={(e) => setProgrammeLevel(e.target.value)}
                  placeholder="e.g. BSc Nursing · Level 200"
                  className="mt-1.5 block w-full min-h-[42px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#14532D] focus:outline-none focus:ring-2 focus:ring-[#14532D]/15"
                />
              </div>

              <label className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#14532D] focus:ring-[#14532D]"
                />
                <span className="text-xs leading-relaxed text-slate-700">
                  I have read and accept the landlord’s tenancy terms, utility arrangement, and hostel rules for{' '}
                  <span className="font-semibold text-slate-900">{hostel.name}</span>.
                </span>
              </label>

              <button
                type="submit"
                className="flex min-h-[44px] w-full items-center justify-center rounded-lg bg-[#14532D] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#166534] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14532D]"
              >
                Confirm Bed Reservation
              </button>
            </form>
          )}
        </div>
      </div>
    </ModalShell>
  );
};
