import React, { useMemo, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  FileText,
  Images,
  Search,
  SlidersHorizontal,
  Wrench,
} from 'lucide-react';
import {
  BookingRecord,
  CampusLocation,
  Hostel,
  MaintenanceCategory,
  OccupancyType,
  Room,
  UserAccount,
} from '../types/hostel';
import { CAMPUSES } from '../data/seedData';
import { formatGhs, formatShortDate } from '../utils/storage';
import { HostelImage } from './HostelImage';
import { RoomReservationModal } from './RoomReservationModal';
import { ReportIssueModal } from './ReportIssueModal';
import { ModalShell } from './ModalShell';
import { HostelGalleryModal } from './HostelGalleryModal';

interface StudentPortalProps {
  currentUser: UserAccount | null;
  hostels: Hostel[];
  rooms: Room[];
  bookings: BookingRecord[];
  onRequireAuthForBooking: () => void;
  onCreateBooking: (payload: {
    roomId: string;
    hostelId: string;
    studentName: string;
    studentId: string;
    studentPhone: string;
    programmeLevel: string;
    acceptedTerms: boolean;
  }) => BookingRecord;
  onViewBookingSlip: (booking: BookingRecord) => void;
  onSubmitMaintenanceIssue: (payload: {
    hostelId: string;
    roomNumber: string;
    category: MaintenanceCategory;
    description: string;
    reportedBy: string;
    studentId: string;
  }) => void;
}

const ITEMS_PER_PAGE = 12;

export const StudentPortal: React.FC<StudentPortalProps> = ({
  currentUser,
  hostels,
  rooms,
  bookings,
  onRequireAuthForBooking,
  onCreateBooking,
  onViewBookingSlip,
  onSubmitMaintenanceIssue,
}) => {
  const [selectedCampus, setSelectedCampus] = useState<'All' | CampusLocation>('All');
  const [selectedHostelId, setSelectedHostelId] = useState<string>('All');
  const [selectedOccupancy, setSelectedOccupancy] = useState<'All' | OccupancyType>('All');
  const [minRent, setMinRent] = useState<string>('');
  const [maxRent, setMaxRent] = useState<string>('');
  const [availableOnly, setAvailableOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [inspectedHostelId, setInspectedHostelId] = useState<string | null>(null);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isBookingsDrawerOpen, setIsBookingsDrawerOpen] = useState(false);
  const [issueToast, setIssueToast] = useState<string | null>(null);

  const hostelMap = useMemo(() => {
    const map = new Map<string, Hostel>();
    for (const h of hostels) {
      map.set(h.id, h);
    }
    return map;
  }, [hostels]);

  // Aggregate real-time availability per hostel
  const hostelStatsMap = useMemo(() => {
    const stats = new Map<
      string,
      { totalRooms: number; availableRooms: number; totalBeds: number; availableBeds: number }
    >();
    for (const h of hostels) {
      stats.set(h.id, { totalRooms: 0, availableRooms: 0, totalBeds: 0, availableBeds: 0 });
    }
    for (const r of rooms) {
      const entry = stats.get(r.hostelId);
      if (!entry) continue;
      entry.totalRooms += 1;
      entry.totalBeds += r.totalBeds;
      if (r.status === 'Available' && r.availableBeds > 0) {
        entry.availableRooms += 1;
        entry.availableBeds += r.availableBeds;
      }
    }
    return stats;
  }, [hostels, rooms]);

  // Hostels visible in selected campus
  const visibleHostels = useMemo(() => {
    if (selectedCampus === 'All') return hostels;
    return hostels.filter((h) => h.campus === selectedCampus);
  }, [hostels, selectedCampus]);

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    const min = minRent ? Number(minRent) : null;
    const max = maxRent ? Number(maxRent) : null;
    const q = searchQuery.trim().toLowerCase();

    return rooms.filter((room) => {
      const hostel = hostelMap.get(room.hostelId);
      if (!hostel) return false;

      if (selectedCampus !== 'All' && hostel.campus !== selectedCampus) return false;
      if (selectedHostelId !== 'All' && room.hostelId !== selectedHostelId) return false;
      if (selectedOccupancy !== 'All' && room.occupancyType !== selectedOccupancy) return false;
      if (min !== null && !Number.isNaN(min) && room.annualRentGhs < min) return false;
      if (max !== null && !Number.isNaN(max) && room.annualRentGhs > max) return false;
      if (availableOnly && (room.status !== 'Available' || room.availableBeds <= 0)) return false;

      if (q) {
        const hay = `${room.roomNumber} ${hostel.name} ${hostel.campus} ${room.occupancyType}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [
    rooms,
    hostelMap,
    selectedCampus,
    selectedHostelId,
    selectedOccupancy,
    minRent,
    maxRent,
    availableOnly,
    searchQuery,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredRooms.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRooms = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredRooms.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRooms, safePage]);

  const summaryTotals = useMemo(() => {
    let availableRooms = 0;
    let availableBeds = 0;
    for (const r of rooms) {
      if (r.status === 'Available' && r.availableBeds > 0) {
        availableRooms += 1;
        availableBeds += r.availableBeds;
      }
    }
    return {
      totalHostels: hostels.length,
      totalRooms: rooms.length,
      availableRooms,
      availableBeds,
    };
  }, [hostels.length, rooms]);

  const handleCampusChange = (campus: 'All' | CampusLocation) => {
    setSelectedCampus(campus);
    setSelectedHostelId('All');
    setCurrentPage(1);
  };

  const handleSelectHostelCard = (hostelId: string) => {
    setSelectedHostelId((prev) => (prev === hostelId ? 'All' : hostelId));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSelectedCampus('All');
    setSelectedHostelId('All');
    setSelectedOccupancy('All');
    setMinRent('');
    setMaxRent('');
    setAvailableOnly(false);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleBookingConfirm = (payload: {
    roomId: string;
    hostelId: string;
    studentName: string;
    studentId: string;
    studentPhone: string;
    programmeLevel: string;
    acceptedTerms: boolean;
  }) => {
    const created = onCreateBooking(payload);
    setActiveRoom(null);
    onViewBookingSlip(created);
  };

  const handleIssueSubmitted = (payload: {
    hostelId: string;
    roomNumber: string;
    category: MaintenanceCategory;
    description: string;
    reportedBy: string;
    studentId: string;
  }) => {
    onSubmitMaintenanceIssue(payload);
    setIssueToast('Maintenance ticket submitted to Caretaker Portal.');
    setTimeout(() => setIssueToast(null), 5000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Compact Academic Hero + Live Portfolio Summary */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold tracking-wide text-[#B45309]">
              UDS STUDENT ACCOMMODATION PORTAL · 2026/2027 ACADEMIC YEAR
            </div>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl text-balance">
              Verified Campus Hostels with Instant Bed Reservation
            </h1>
            <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
              Compare room occupancy, transparent utility details, and annual GHS rates across Mr. Abdul-Karim’s Tamale Campus residences and verified partner hostels in Nyankpala, City, and Wa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsBookingsDrawerOpen(true)}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap"
            >
              <FileText className="h-4 w-4 text-[#14532D]" />
              <span>Booking Slips ({bookings.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setIsIssueModalOpen(true)}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-[#D97706]/40 bg-[#D97706]/10 px-4 py-2 text-xs font-semibold text-[#92400E] transition-colors hover:bg-[#D97706]/15 whitespace-nowrap"
            >
              <Wrench className="h-4 w-4" />
              <span>Report Room Issue</span>
            </button>
          </div>
        </div>

        {/* 4-column Live Inventory Strip */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-200 pt-6 sm:grid-cols-4">
          <div>
            <div className="text-xs text-slate-500">Listed Hostels</div>
            <div className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
              {summaryTotals.totalHostels}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Total Inventory</div>
            <div className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
              {summaryTotals.totalRooms} Rooms
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Rooms With Open Beds</div>
            <div className="mt-1 font-mono text-2xl font-bold text-[#14532D] tabular-nums">
              {summaryTotals.availableRooms}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Bed Spaces Remaining</div>
            <div className="mt-1 font-mono text-2xl font-bold text-[#B45309] tabular-nums">
              {summaryTotals.availableBeds} Beds
            </div>
          </div>
        </div>
      </section>

      {issueToast && (
        <div
          role="status"
          className="flex items-center justify-between rounded-lg border border-[#14532D]/30 bg-[#14532D]/10 px-4 py-3 text-sm font-medium text-[#14532D]"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{issueToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setIssueToast(null)}
            aria-label="Dismiss notification"
            className="text-xs font-semibold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Hostel Directory Cards */}
      <section aria-labelledby="hostels-heading" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="hostels-heading" className="font-display text-lg font-bold text-slate-900">
              Hostel Directory
            </h2>
            <p className="text-xs text-slate-600">
              Select a hostel card to filter its rooms, or browse all properties below.
            </p>
          </div>

          {/* Campus Segmented Filter */}
          <div
            role="group"
            aria-label="Filter by UDS Campus"
            className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-white p-1"
          >
            {(['All', ...CAMPUSES] as const).map((campus) => {
              const active = selectedCampus === campus;
              return (
                <button
                  key={campus}
                  type="button"
                  onClick={() => handleCampusChange(campus)}
                  className={`min-h-[34px] rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#14532D] text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {campus === 'All' ? 'All Campuses' : `${campus}`}
                </button>
              );
            })}
          </div>
        </div>

        {visibleHostels.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <Building2 className="mx-auto h-8 w-8 text-slate-400" strokeWidth={1.5} />
            <p className="mt-2 text-sm font-semibold text-slate-800">
              No hostels registered on {selectedCampus} Campus yet
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Hostel owners can register a property for {selectedCampus} Campus using the button in the top bar.
            </p>
            <button
              type="button"
              onClick={() => handleCampusChange('All')}
              className="mt-4 inline-flex min-h-[40px] items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Show All Campuses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visibleHostels.map((hostel) => {
              const stats = hostelStatsMap.get(hostel.id) ?? {
                totalRooms: 0,
                availableRooms: 0,
                totalBeds: 0,
                availableBeds: 0,
              };
              const isSelected = selectedHostelId === hostel.id;
              const photoCount = hostel.photos?.length ?? 0;

              return (
                <article
                  key={hostel.id}
                  className={`group flex flex-col overflow-hidden rounded-xl border bg-white text-left transition-all duration-150 ${
                    isSelected
                      ? 'border-[#14532D] ring-2 ring-[#14532D]/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setInspectedHostelId(hostel.id)}
                    className="relative h-44 w-full overflow-hidden bg-slate-100 text-left focus-visible:outline-2 focus-visible:outline-[#14532D]"
                  >
                    <HostelImage
                      src={hostel.photos?.[0]?.url || hostel.imageUrl}
                      alt={hostel.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-md bg-slate-900/80 px-2.5 py-1 text-[11px] font-semibold text-white">
                      <Images className="h-3.5 w-3.5" />
                      <span className="tabular-nums">{photoCount} Photos</span>
                    </span>
                  </button>

                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-[#14532D]">{hostel.campus} Campus</span>
                        <span aria-hidden="true">·</span>
                        <span>{hostel.ownerName}</span>
                      </div>
                      <h3 className="mt-1.5 font-display text-base font-bold text-slate-900">
                        {hostel.name}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-600 line-clamp-2">
                        {hostel.description}
                      </p>
                    </div>

                    <div className="mt-4 space-y-3 border-t border-slate-100 pt-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-semibold text-slate-900 tabular-nums">
                          {stats.availableRooms} of {stats.totalRooms} rooms open
                        </span>
                        <span className="font-mono font-semibold text-[#B45309] tabular-nums">
                          {stats.availableBeds} beds left
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setInspectedHostelId(hostel.id)}
                          className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          <Images className="h-3.5 w-3.5 text-[#14532D]" />
                          <span>Gallery &amp; Info</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectHostelCard(hostel.id)}
                          className={`inline-flex min-h-[38px] items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                            isSelected
                              ? 'bg-[#14532D] text-white'
                              : 'bg-[#14532D]/10 text-[#14532D] hover:bg-[#14532D]/15'
                          }`}
                        >
                          {isSelected ? 'Filtered (Clear)' : 'Filter Rooms'}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Room Filter Bar & Inventory Grid */}
      <section aria-labelledby="rooms-heading" className="space-y-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-[#14532D]" />
              <h2 id="rooms-heading" className="font-display text-base font-bold text-slate-900">
                Browse Available Rooms
              </h2>
              <span className="text-xs text-slate-500 tabular-nums">
                ({filteredRooms.length} matching)
              </span>
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="self-start text-xs font-semibold text-[#14532D] hover:underline sm:self-auto"
            >
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {/* Search Room */}
            <div className="lg:col-span-2">
              <label htmlFor="filter-search" className="block text-xs font-medium text-slate-600">
                Search Room or Hostel
              </label>
              <div className="relative mt-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="filter-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="e.g. Block A - R101, Royal..."
                  className="block w-full min-h-[40px] rounded-lg border border-slate-300 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#14532D] focus:outline-none"
                />
              </div>
            </div>

            {/* Hostel Select */}
            <div>
              <label htmlFor="filter-hostel" className="block text-xs font-medium text-slate-600">
                Specific Hostel
              </label>
              <select
                id="filter-hostel"
                value={selectedHostelId}
                onChange={(e) => {
                  setSelectedHostelId(e.target.value);
                  setCurrentPage(1);
                }}
                className="mt-1 block w-full min-h-[40px] rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-[#14532D] focus:outline-none"
              >
                <option value="All">All Hostels ({visibleHostels.length})</option>
                {visibleHostels.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Occupancy Select */}
            <div>
              <label htmlFor="filter-occ" className="block text-xs font-medium text-slate-600">
                Occupancy Type
              </label>
              <select
                id="filter-occ"
                value={selectedOccupancy}
                onChange={(e) => {
                  setSelectedOccupancy(e.target.value as 'All' | OccupancyType);
                  setCurrentPage(1);
                }}
                className="mt-1 block w-full min-h-[40px] rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-[#14532D] focus:outline-none"
              >
                <option value="All">All Types</option>
                <option value="1-in-1">1-in-1 (Single)</option>
                <option value="2-in-1">2-in-1 (Shared)</option>
                <option value="4-in-1">4-in-1 (Standard)</option>
              </select>
            </div>

            {/* Min Rent */}
            <div>
              <label htmlFor="filter-min-rent" className="block text-xs font-medium text-slate-600">
                Min Rent (GHS)
              </label>
              <input
                id="filter-min-rent"
                type="number"
                min={0}
                step={100}
                value={minRent}
                onChange={(e) => {
                  setMinRent(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="e.g. 1500"
                className="mt-1 block w-full min-h-[40px] rounded-lg border border-slate-300 px-3 font-mono text-sm text-slate-900 placeholder:font-sans placeholder:text-slate-400 focus:border-[#14532D] focus:outline-none tabular-nums"
              />
            </div>

            {/* Max Rent */}
            <div>
              <label htmlFor="filter-max-rent" className="block text-xs font-medium text-slate-600">
                Max Rent (GHS)
              </label>
              <input
                id="filter-max-rent"
                type="number"
                min={0}
                step={100}
                value={maxRent}
                onChange={(e) => {
                  setMaxRent(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="e.g. 4600"
                className="mt-1 block w-full min-h-[40px] rounded-lg border border-slate-300 px-3 font-mono text-sm text-slate-900 placeholder:font-sans placeholder:text-slate-400 focus:border-[#14532D] focus:outline-none tabular-nums"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => {
                  setAvailableOnly(e.target.checked);
                  setCurrentPage(1);
                }}
                className="h-4 w-4 rounded border-slate-300 text-[#14532D] focus:ring-[#14532D]"
              />
              <span>Show rooms with available bed spaces only</span>
            </label>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500">Quick Budgets:</span>
              <button
                type="button"
                onClick={() => {
                  setMinRent('');
                  setMaxRent('2000');
                  setCurrentPage(1);
                }}
                className="rounded-md border border-slate-200 px-2.5 py-1 font-medium text-slate-700 hover:bg-slate-50"
              >
                Under GHS 2,000
              </button>
              <button
                type="button"
                onClick={() => {
                  setMinRent('2000');
                  setMaxRent('3500');
                  setCurrentPage(1);
                }}
                className="rounded-md border border-slate-200 px-2.5 py-1 font-medium text-slate-700 hover:bg-slate-50"
              >
                GHS 2,000 – 3,500
              </button>
              <button
                type="button"
                onClick={() => {
                  setMinRent('3500');
                  setMaxRent('');
                  setCurrentPage(1);
                }}
                className="rounded-md border border-slate-200 px-2.5 py-1 font-medium text-slate-700 hover:bg-slate-50"
              >
                GHS 3,500+
              </button>
            </div>
          </div>
        </div>

        {/* Rooms Grid */}
        {paginatedRooms.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-sm font-semibold text-slate-800">
              No rooms match your current filter selection.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Try clearing your rent range or switching back to All Campuses.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 inline-flex min-h-[40px] items-center rounded-lg bg-[#14532D] px-4 py-2 text-xs font-semibold text-white hover:bg-[#166534]"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedRooms.map((room) => {
              const hostel = hostelMap.get(room.hostelId);
              if (!hostel) return null;

              const isOpen = room.status === 'Available' && room.availableBeds > 0;
              const isMaintenance = room.status === 'Under Maintenance';

              let availabilityLabel = '';
              let availabilityTone = '';
              if (isMaintenance) {
                availabilityLabel = 'Under Maintenance';
                availabilityTone = 'bg-slate-100 text-slate-700 border-slate-200';
              } else if (!isOpen) {
                availabilityLabel = 'Full';
                availabilityTone = 'bg-red-50 text-red-800 border-red-200';
              } else if (room.availableBeds === 1) {
                availabilityLabel = `1 of ${room.totalBeds} Bed${room.totalBeds > 1 ? 's' : ''} Left`;
                availabilityTone = 'bg-amber-50 text-[#92400E] border-amber-200';
              } else {
                availabilityLabel = `${room.availableBeds} of ${room.totalBeds} Beds Left`;
                availabilityTone = 'bg-[#14532D]/10 text-[#14532D] border-[#14532D]/20';
              }

              return (
                <div
                  key={room.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs text-slate-500">
                          {hostel.name} · {hostel.campus}
                        </div>
                        <h3 className="mt-1 font-display text-base font-bold text-slate-900">
                          {room.roomNumber}
                        </h3>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-xs font-semibold tabular-nums ${availabilityTone}`}
                      >
                        {availabilityLabel}
                      </span>
                    </div>

                    <div className="mt-3 flex items-baseline justify-between border-y border-slate-100 py-2.5">
                      <span className="text-xs font-medium text-slate-600">
                        {room.occupancyType} Room
                      </span>
                      <div className="text-right">
                        <span className="font-mono text-base font-bold text-[#14532D] tabular-nums">
                          {formatGhs(room.annualRentGhs)}
                        </span>
                        <span className="ml-1 text-xs text-slate-500">/ year</span>
                      </div>
                    </div>

                    <p className="mt-3 text-xs leading-relaxed text-slate-600 line-clamp-2">
                      {room.utilityDetails}
                    </p>

                    <div className="mt-2.5 text-xs text-slate-500 line-clamp-1">
                      {room.amenities.slice(0, 4).join(' · ')}
                      {room.amenities.length > 4 ? ` · +${room.amenities.length - 4} more` : ''}
                    </div>
                  </div>

                  <div className="mt-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveRoom(room)}
                      className={`flex min-h-[42px] w-full items-center justify-center rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                        isOpen
                          ? 'bg-[#14532D] text-white hover:bg-[#166534]'
                          : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {isOpen ? 'View Details & Book' : 'Inspect Room Details'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3.5 sm:flex-row">
            <div className="text-xs text-slate-600 tabular-nums">
              Showing {(safePage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(safePage * ITEMS_PER_PAGE, filteredRooms.length)} of {filteredRooms.length} rooms
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="min-h-[38px] rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-2 font-mono text-xs font-medium text-slate-700 tabular-nums">
                Page {safePage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="min-h-[38px] rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Hostel Overview & Categorized Photo Gallery Modal */}
      <HostelGalleryModal
        hostel={inspectedHostelId ? hostelMap.get(inspectedHostelId) ?? null : null}
        stats={inspectedHostelId ? hostelStatsMap.get(inspectedHostelId) : undefined}
        onClose={() => setInspectedHostelId(null)}
        onFilterToHostelRooms={(hostelId) => {
          setSelectedHostelId(hostelId);
          setCurrentPage(1);
        }}
      />

      {/* Room Reservation Modal */}
      <RoomReservationModal
        room={activeRoom}
        hostel={activeRoom ? hostelMap.get(activeRoom.hostelId) : undefined}
        currentUser={currentUser}
        onClose={() => setActiveRoom(null)}
        onRequireAuth={onRequireAuthForBooking}
        onSubmitBooking={handleBookingConfirm}
      />

      {/* Report Issue Modal */}
      <ReportIssueModal
        isOpen={isIssueModalOpen}
        hostels={hostels}
        rooms={rooms}
        onClose={() => setIsIssueModalOpen(false)}
        onSubmitIssue={handleIssueSubmitted}
      />

      {/* Student Recent Booking Slips Modal */}
      <ModalShell
        isOpen={isBookingsDrawerOpen}
        onClose={() => setIsBookingsDrawerOpen(false)}
        title={`Booking Confirmation Slips (${bookings.length})`}
        subtitle="GENERATED RESERVATION RECORDS"
        titleId="recent-slips-title"
        maxWidthClass="max-w-2xl"
      >
        <div className="divide-y divide-slate-100 p-6">
          {bookings.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              No reservations have been recorded yet.
            </p>
          ) : (
            bookings.map((b) => {
              const hostel = hostelMap.get(b.hostelId);
              const room = rooms.find((r) => r.id === b.roomId);
              return (
                <div
                  key={b.id}
                  className="flex flex-col justify-between gap-3 py-3.5 sm:flex-row sm:items-center"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono font-bold text-[#14532D]">
                        {b.referenceCode}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{formatShortDate(b.createdAt)}</span>
                      <span aria-hidden="true">·</span>
                      <span className={b.checkedIn ? 'text-[#14532D] font-semibold' : 'text-[#B45309] font-semibold'}>
                        {b.checkedIn ? 'Checked In' : 'Pending Check-In'}
                      </span>
                    </div>
                    <div className="mt-0.5 text-sm font-semibold text-slate-900">
                      {b.studentName} ({b.studentId})
                    </div>
                    <div className="text-xs text-slate-600">
                      {hostel?.name ?? 'Hostel'} · {room?.roomNumber ?? 'Room'} ·{' '}
                      <span className="font-mono tabular-nums">{formatGhs(b.annualRentGhs)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsBookingsDrawerOpen(false);
                      onViewBookingSlip(b);
                    }}
                    className="inline-flex min-h-[38px] shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Open Printable Slip
                  </button>
                </div>
              );
            })
          )}
        </div>
      </ModalShell>
    </div>
  );
};
