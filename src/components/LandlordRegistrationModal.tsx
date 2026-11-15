import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { CampusLocation, OccupancyType } from '../types/hostel';
import { CAMPUSES, DEFAULT_AMENITIES, HOSTEL_IMAGES } from '../data/seedData';
import { formatGhs } from '../utils/storage';
import { ModalShell } from './ModalShell';

export interface DraftRoomInput {
  tempId: string;
  roomNumber: string;
  occupancyType: OccupancyType;
  totalBeds: number;
  annualRentGhs: number;
  utilityDetails: string;
  amenities: string[];
}

interface LandlordRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterLandlordAndHostel: (payload: {
    ownerFullName: string;
    ownerContact: string;
    ownerPassword: string;
    hostelName: string;
    campus: CampusLocation;
    contactPhone: string;
    description: string;
    rules: string[];
    imageUrl: string;
    draftRooms: DraftRoomInput[];
  }) => void;
}

function bedsForOccupancy(type: OccupancyType): number {
  if (type === '1-in-1') return 1;
  if (type === '2-in-1') return 2;
  return 4;
}

export const LandlordRegistrationModal: React.FC<LandlordRegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegisterLandlordAndHostel,
}) => {
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Owner Account
  const [ownerFullName, setOwnerFullName] = useState('');
  const [ownerContact, setOwnerContact] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');

  // Step 2: Hostel Info
  const [hostelName, setHostelName] = useState('');
  const [campus, setCampus] = useState<CampusLocation>('Nyankpala');
  const [contactPhone, setContactPhone] = useState('');
  const [description, setDescription] = useState('');
  const [rulesText, setRulesText] = useState(
    'Full annual rent covers two academic semesters.\nPrepaid ECG meter credits are shared equally among room occupants.\nQuiet study hours are observed from 10:00 PM to 5:30 AM.'
  );

  // Bulk & Single Room Builder
  const [blockPrefix, setBlockPrefix] = useState('Block A');
  const [startNum, setStartNum] = useState(101);
  const [roomCount, setRoomCount] = useState(6);
  const [occupancyType, setOccupancyType] = useState<OccupancyType>('2-in-1');
  const [rentGhs, setRentGhs] = useState(2500);
  const [utilityDetails, setUtilityDetails] = useState(
    'Prepaid ECG meter · Borehole water supply included'
  );
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Wi-Fi',
    'Security Fence',
    'Study Desk',
    'Backup Generator',
  ]);
  const [draftRooms, setDraftRooms] = useState<DraftRoomInput[]>([]);
  const [error, setError] = useState<string | null>(null);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleBulkAddRooms = () => {
    setError(null);
    const count = Math.max(1, Math.min(60, Number(roomCount) || 1));
    const start = Math.max(1, Number(startNum) || 101);
    const rent = Math.max(200, Number(rentGhs) || 2000);
    const beds = bedsForOccupancy(occupancyType);

    const existingNames = new Set(draftRooms.map((r) => r.roomNumber.toLowerCase()));
    const newBatch: DraftRoomInput[] = [];

    for (let i = 0; i < count; i++) {
      const label = `${blockPrefix.trim() || 'Block A'} - R${start + i}`;
      if (existingNames.has(label.toLowerCase())) continue;
      newBatch.push({
        tempId: `draft-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        roomNumber: label,
        occupancyType,
        totalBeds: beds,
        annualRentGhs: rent,
        utilityDetails: utilityDetails.trim() || 'Prepaid ECG meter · Borehole water',
        amenities: selectedAmenities.length > 0 ? [...selectedAmenities] : ['Security Fence'],
      });
    }

    if (newBatch.length === 0) {
      setError('Those room numbers already exist in your list. Try a different block or starting number.');
      return;
    }

    setDraftRooms((prev) => [...prev, ...newBatch]);
    setStartNum(start + count);
  };

  const handleAddSingleRoom = () => {
    setError(null);
    const start = Math.max(1, Number(startNum) || 101);
    const rent = Math.max(200, Number(rentGhs) || 2000);
    const beds = bedsForOccupancy(occupancyType);
    const label = `${blockPrefix.trim() || 'Block A'} - R${start}`;

    if (draftRooms.some((r) => r.roomNumber.toLowerCase() === label.toLowerCase())) {
      setError(`Room "${label}" is already in your draft list.`);
      return;
    }

    setDraftRooms((prev) => [
      ...prev,
      {
        tempId: `draft-single-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        roomNumber: label,
        occupancyType,
        totalBeds: beds,
        annualRentGhs: rent,
        utilityDetails: utilityDetails.trim() || 'Prepaid ECG meter · Borehole water',
        amenities: selectedAmenities.length > 0 ? [...selectedAmenities] : ['Security Fence'],
      },
    ]);
    setStartNum(start + 1);
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!ownerFullName.trim() || !ownerContact.trim() || !ownerPassword.trim()) {
      setError('Please complete your full name, email or phone, and password.');
      return;
    }
    if (!contactPhone.trim()) {
      setContactPhone(ownerContact.trim());
    }
    setStep(2);
  };

  const handleCompleteRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!hostelName.trim() || !contactPhone.trim() || !description.trim()) {
      setError('Please provide the hostel name, contact phone, and property description.');
      return;
    }
    if (draftRooms.length === 0) {
      setError('Please add at least 1 room (using Add Room Batch or Add 1 Room) before publishing.');
      return;
    }

    const rules = rulesText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    onRegisterLandlordAndHostel({
      ownerFullName: ownerFullName.trim(),
      ownerContact: ownerContact.trim(),
      ownerPassword,
      hostelName: hostelName.trim(),
      campus,
      contactPhone: contactPhone.trim(),
      description: description.trim(),
      rules:
        rules.length > 0
          ? rules
          : ['Tenancy covers one full academic year. Prepaid utilities shared per room.'],
      imageUrl: HOSTEL_IMAGES.annex,
      draftRooms,
    });

    // Reset form state for next time
    setStep(1);
    setOwnerFullName('');
    setOwnerContact('');
    setOwnerPassword('');
    setHostelName('');
    setDescription('');
    setDraftRooms([]);
    onClose();
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={step === 1 ? 'Create Hostel Owner Account' : 'List Your First Hostel & Rooms'}
      subtitle={`STEP ${step} OF 2 · HOSTEL OWNER ONBOARDING`}
      titleId="owner-reg-title"
      maxWidthClass="max-w-3xl"
    >

        {error && (
          <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-800">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleNextStep} className="p-6 space-y-4">
            <p className="text-sm text-slate-600">
              Register your landlord account to publish hostels across Tamale, Nyankpala, City, or Wa campuses. New listings appear immediately in the Student Portal.
            </p>

            <div>
              <label htmlFor="reg-fullname" className="block text-xs font-semibold text-slate-700">
                Owner Full Name
              </label>
              <input
                id="reg-fullname"
                type="text"
                required
                value={ownerFullName}
                onChange={(e) => setOwnerFullName(e.target.value)}
                placeholder="e.g. Hajia Mariama Salifu"
                className="mt-1.5 block w-full min-h-[42px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#14532D] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="reg-contact" className="block text-xs font-semibold text-slate-700">
                  Email or Phone Number
                </label>
                <input
                  id="reg-contact"
                  type="text"
                  required
                  value={ownerContact}
                  onChange={(e) => setOwnerContact(e.target.value)}
                  placeholder="e.g. 024 771 8900 or email"
                  className="mt-1.5 block w-full min-h-[42px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#14532D] focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-700">
                  Account Password
                </label>
                <input
                  id="reg-password"
                  type="password"
                  required
                  value={ownerPassword}
                  onChange={(e) => setOwnerPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="mt-1.5 block w-full min-h-[42px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#14532D] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[42px] rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[42px] rounded-lg bg-[#14532D] px-5 py-2 text-sm font-semibold text-white hover:bg-[#166534]"
              >
                Continue to Hostel Setup
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCompleteRegistration} className="p-6 space-y-6">
            {/* Hostel Details */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label htmlFor="reg-hname" className="block text-xs font-semibold text-slate-700">
                  Hostel Name
                </label>
                <input
                  id="reg-hname"
                  type="text"
                  required
                  value={hostelName}
                  onChange={(e) => setHostelName(e.target.value)}
                  placeholder="e.g. Northern Star Scholars Hostel"
                  className="mt-1.5 block w-full min-h-[42px] rounded-lg border border-slate-300 px-3 text-sm text-slate-900 focus:border-[#14532D] focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="reg-campus" className="block text-xs font-semibold text-slate-700">
                  UDS Campus Location
                </label>
                <select
                  id="reg-campus"
                  value={campus}
                  onChange={(e) => setCampus(e.target.value as CampusLocation)}
                  className="mt-1.5 block w-full min-h-[42px] rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-[#14532D] focus:outline-none"
                >
                  {CAMPUSES.map((c) => (
                    <option key={c} value={c}>
                      {c} Campus
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="reg-phone" className="block text-xs font-semibold text-slate-700">
                  Hostel Contact Phone
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="e.g. 024 771 8900"
                  className="mt-1.5 block w-full min-h-[42px] rounded-lg border border-slate-300 px-3 font-mono text-sm text-slate-900 focus:border-[#14532D] focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="reg-desc" className="block text-xs font-semibold text-slate-700">
                  Property Description
                </label>
                <input
                  id="reg-desc"
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Distance to campus, security, water & study environment..."
                  className="mt-1.5 block w-full min-h-[42px] rounded-lg border border-slate-300 px-3 text-sm text-slate-900 focus:border-[#14532D] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-rules" className="block text-xs font-semibold text-slate-700">
                Hostel Rules & Tenancy Terms (one rule per line)
              </label>
              <textarea
                id="reg-rules"
                rows={3}
                value={rulesText}
                onChange={(e) => setRulesText(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs leading-relaxed text-slate-900 focus:border-[#14532D] focus:outline-none"
              />
            </div>

            {/* Room Builder */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Add Rooms (Bulk Batch or Single Room)
                </h3>
                <span className="font-mono text-xs font-semibold text-[#14532D] tabular-nums">
                  {draftRooms.length} rooms queued
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                <div>
                  <label className="block text-xs font-medium text-slate-600">Block</label>
                  <input
                    type="text"
                    value={blockPrefix}
                    onChange={(e) => setBlockPrefix(e.target.value)}
                    className="mt-1 block w-full min-h-[38px] rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">Start No.</label>
                  <input
                    type="number"
                    min={1}
                    value={startNum}
                    onChange={(e) => setStartNum(Number(e.target.value))}
                    className="mt-1 block w-full min-h-[38px] rounded-lg border border-slate-300 bg-white px-2.5 font-mono text-xs text-slate-900 tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">Batch Qty</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={roomCount}
                    onChange={(e) => setRoomCount(Number(e.target.value))}
                    className="mt-1 block w-full min-h-[38px] rounded-lg border border-slate-300 bg-white px-2.5 font-mono text-xs text-slate-900 tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">Occupancy</label>
                  <select
                    value={occupancyType}
                    onChange={(e) => setOccupancyType(e.target.value as OccupancyType)}
                    className="mt-1 block w-full min-h-[38px] rounded-lg border border-slate-300 bg-white px-2 text-xs text-slate-900"
                  >
                    <option value="1-in-1">1-in-1 (1 Bed)</option>
                    <option value="2-in-1">2-in-1 (2 Beds)</option>
                    <option value="4-in-1">4-in-1 (4 Beds)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">Annual Rent (GHS)</label>
                  <input
                    type="number"
                    min={200}
                    step={50}
                    value={rentGhs}
                    onChange={(e) => setRentGhs(Number(e.target.value))}
                    className="mt-1 block w-full min-h-[38px] rounded-lg border border-slate-300 bg-white px-2.5 font-mono text-xs text-slate-900 tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600">Utility Details</label>
                <input
                  type="text"
                  value={utilityDetails}
                  onChange={(e) => setUtilityDetails(e.target.value)}
                  className="mt-1 block w-full min-h-[38px] rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900"
                />
              </div>

              <div>
                <div className="text-xs font-medium text-slate-600">Amenities</div>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {DEFAULT_AMENITIES.map((amenity) => {
                    const checked = selectedAmenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => toggleAmenity(amenity)}
                        className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                          checked
                            ? 'border-[#14532D] bg-[#14532D]/10 text-[#14532D]'
                            : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {amenity}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleBulkAddRooms}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-[#14532D] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#166534]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Bulk-Add {roomCount} Rooms</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddSingleRoom}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add 1 Room ({blockPrefix} - R{startNum})</span>
                </button>
              </div>

              {draftRooms.length > 0 && (
                <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white divide-y divide-slate-100">
                  {draftRooms.map((dr) => (
                    <div
                      key={dr.tempId}
                      className="flex items-center justify-between px-3 py-2 text-xs"
                    >
                      <div className="flex items-center gap-2 text-slate-700">
                        <span className="font-semibold text-slate-900">{dr.roomNumber}</span>
                        <span aria-hidden="true">·</span>
                        <span>{dr.occupancyType}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono font-semibold text-[#14532D] tabular-nums">
                          {formatGhs(dr.annualRentGhs)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setDraftRooms((prev) => prev.filter((item) => item.tempId !== dr.tempId))
                        }
                        aria-label={`Remove ${dr.roomNumber}`}
                        className="text-slate-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="min-h-[42px] rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="submit"
                className="min-h-[42px] rounded-lg bg-[#14532D] px-5 py-2 text-sm font-semibold text-white hover:bg-[#166534]"
              >
                Publish Hostel & Open Dashboard
              </button>
            </div>
          </form>
        )}
    </ModalShell>
  );
};
