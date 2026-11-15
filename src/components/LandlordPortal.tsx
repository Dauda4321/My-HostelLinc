import React, { useMemo, useState } from 'react';
import {
  Building2,
  Check,
  Edit3,
  Images,
  Plus,
  Search,
  X,
} from 'lucide-react';
import {
  BookingRecord,
  CampusLocation,
  Hostel,
  HostelPhoto,
  OccupancyType,
  Room,
  RoomStatus,
  UserAccount,
} from '../types/hostel';
import { CAMPUSES, DEFAULT_AMENITIES, HOSTEL_IMAGES } from '../data/seedData';
import { formatGhs, formatShortDate } from '../utils/storage';
import { DraftRoomInput } from './LandlordRegistrationModal';
import { ModalShell } from './ModalShell';
import { PhotoManager } from './PhotoManager';

interface LandlordPortalProps {
  currentUser: UserAccount;
  hostels: Hostel[];
  rooms: Room[];
  bookings: BookingRecord[];
  onUpdateRoom: (
    roomId: string,
    updates: Partial<Pick<Room, 'annualRentGhs' | 'status' | 'availableBeds' | 'photos'>>
  ) => void;
  onUpdateHostel: (
    hostelId: string,
    updates: Partial<
      Pick<Hostel, 'name' | 'contactPhone' | 'description' | 'rules' | 'photos' | 'imageUrl'>
    >
  ) => void;
  onAddHostelForActiveOwner: (payload: {
    name: string;
    campus: CampusLocation;
    contactPhone: string;
    description: string;
    rules: string[];
    imageUrl: string;
    photos?: HostelPhoto[];
    draftRooms: DraftRoomInput[];
  }) => void;
  onAddRoomsToHostel: (hostelId: string, newRooms: DraftRoomInput[]) => void;
}

type LandlordTab = 'inventory' | 'rules' | 'bookings';

function bedsForOccupancy(type: OccupancyType): number {
  if (type === '1-in-1') return 1;
  if (type === '2-in-1') return 2;
  return 4;
}

export const LandlordPortal: React.FC<LandlordPortalProps> = ({
  currentUser,
  hostels,
  rooms,
  bookings,
  onUpdateRoom,
  onUpdateHostel,
  onAddHostelForActiveOwner,
  onAddRoomsToHostel,
}) => {
  const activeOwner = currentUser;

  const ownerHostels = useMemo(
    () => hostels.filter((h) => h.ownerId === activeOwner?.id),
    [hostels, activeOwner]
  );

  const ownerHostelIds = useMemo(
    () => new Set(ownerHostels.map((h) => h.id)),
    [ownerHostels]
  );

  const ownerRooms = useMemo(
    () => rooms.filter((r) => ownerHostelIds.has(r.hostelId)),
    [rooms, ownerHostelIds]
  );

  const ownerBookings = useMemo(
    () => bookings.filter((b) => ownerHostelIds.has(b.hostelId)),
    [bookings, ownerHostelIds]
  );

  const [selectedHostelFilter, setSelectedHostelFilter] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<LandlordTab>('inventory');
  const [searchRoom, setSearchRoom] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | RoomStatus>('All');
  const [occupancyFilter, setOccupancyFilter] = useState<'All' | OccupancyType>('All');
  const [page, setPage] = useState(1);

  // Price editing state
  const [editingPriceRoomId, setEditingPriceRoomId] = useState<string | null>(null);
  const [priceDraft, setPriceDraft] = useState<string>('');

  // Rules & Photos editing state
  const [rulesHostelId, setRulesHostelId] = useState<string>('');
  const targetRulesHostel =
    ownerHostels.find((h) => h.id === rulesHostelId) ?? ownerHostels[0];
  const [rulesSavedNotice, setRulesSavedNotice] = useState<string | null>(null);
  const [editPhone, setEditPhone] = useState<string>('');
  const [editDesc, setEditDesc] = useState<string>('');
  const [editRulesText, setEditRulesText] = useState<string>('');
  const [editPhotos, setEditPhotos] = useState<HostelPhoto[]>([]);
  const [editingHostelLoadedId, setEditingHostelLoadedId] = useState<string>('');

  // Sync editor inputs when switching target hostel
  if (targetRulesHostel && editingHostelLoadedId !== targetRulesHostel.id) {
    setEditingHostelLoadedId(targetRulesHostel.id);
    setEditPhone(targetRulesHostel.contactPhone);
    setEditDesc(targetRulesHostel.description);
    setEditRulesText(targetRulesHostel.rules.join('\n'));
    setEditPhotos(targetRulesHostel.photos ?? []);
  }

  // Modals for +Add Rooms, +Add Hostel, and Room Photo Manager
  const [addRoomsHostelId, setAddRoomsHostelId] = useState<string | null>(null);
  const [isAddHostelOpen, setIsAddHostelOpen] = useState(false);
  const [editingPhotosRoomId, setEditingPhotosRoomId] = useState<string | null>(null);
  const editingPhotosRoom = useMemo(
    () => ownerRooms.find((r) => r.id === editingPhotosRoomId) ?? null,
    [ownerRooms, editingPhotosRoomId]
  );

  // Add Rooms form state
  const [batchBlock, setBatchBlock] = useState('Block C');
  const [batchStart, setBatchStart] = useState(101);
  const [batchQty, setBatchQty] = useState(4);
  const [batchOcc, setBatchOcc] = useState<OccupancyType>('2-in-1');
  const [batchRent, setBatchRent] = useState(2800);
  const [batchUtil, setBatchUtil] = useState('Prepaid ECG meter · Borehole water included');

  // Add New Hostel modal state
  const [newHostelName, setNewHostelName] = useState('');
  const [newHostelCampus, setNewHostelCampus] = useState<CampusLocation>('Nyankpala');
  const [newHostelPhone, setNewHostelPhone] = useState(activeOwner.phone || activeOwner.email || '');
  const [newHostelDesc, setNewHostelDesc] = useState('');
  const [newHostelRules, setNewHostelRules] = useState(
    'Annual tenancy covers two academic semesters.\nPrepaid ECG shared per room.\nQuiet hours 10:00 PM to 5:30 AM.'
  );
  const [newHostelRoomQty, setNewHostelRoomQty] = useState(6);
  const [newHostelRoomOcc, setNewHostelRoomOcc] = useState<OccupancyType>('2-in-1');
  const [newHostelRoomRent, setNewHostelRoomRent] = useState(2400);
  const [newHostelPhotos, setNewHostelPhotos] = useState<HostelPhoto[]>([]);

  // Portfolio KPIs scoped to active owner & optional hostel filter
  const scopedRooms = useMemo(() => {
    if (selectedHostelFilter === 'All') return ownerRooms;
    return ownerRooms.filter((r) => r.hostelId === selectedHostelFilter);
  }, [ownerRooms, selectedHostelFilter]);

  const kpis = useMemo(() => {
    let totalRooms = scopedRooms.length;
    let occupiedBeds = 0;
    let availableBeds = 0;
    let projectedRevenueGhs = 0;
    let maxCapacityRevenueGhs = 0;

    for (const r of scopedRooms) {
      const occ = Math.max(0, r.totalBeds - r.availableBeds);
      occupiedBeds += occ;
      if (r.status === 'Available') {
        availableBeds += r.availableBeds;
      }
      projectedRevenueGhs += occ * r.annualRentGhs;
      maxCapacityRevenueGhs += r.totalBeds * r.annualRentGhs;
    }
    return {
      totalRooms,
      occupiedBeds,
      availableBeds,
      projectedRevenueGhs,
      maxCapacityRevenueGhs,
    };
  }, [scopedRooms]);

  const filteredRooms = useMemo(() => {
    const q = searchRoom.trim().toLowerCase();
    return scopedRooms.filter((r) => {
      if (statusFilter !== 'All' && r.status !== statusFilter) return false;
      if (occupancyFilter !== 'All' && r.occupancyType !== occupancyFilter) return false;
      if (q && !r.roomNumber.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [scopedRooms, statusFilter, occupancyFilter, searchRoom]);

  const PAGE_SIZE = 15;
  const totalPages = Math.max(1, Math.ceil(filteredRooms.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleRooms = filteredRooms.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const hostelMap = useMemo(() => {
    const map = new Map<string, Hostel>();
    for (const h of ownerHostels) {
      map.set(h.id, h);
    }
    return map;
  }, [ownerHostels]);

  const handleSavePrice = (room: Room) => {
    const numeric = Number(priceDraft);
    if (!Number.isNaN(numeric) && numeric >= 100) {
      onUpdateRoom(room.id, { annualRentGhs: Math.round(numeric) });
    }
    setEditingPriceRoomId(null);
  };

  const handleStatusChange = (room: Room, nextStatus: RoomStatus) => {
    if (nextStatus === 'Full' || nextStatus === 'Under Maintenance') {
      onUpdateRoom(room.id, { status: nextStatus, availableBeds: 0 });
    } else {
      onUpdateRoom(room.id, {
        status: 'Available',
        availableBeds: room.availableBeds === 0 ? room.totalBeds : room.availableBeds,
      });
    }
  };

  const handleAdjustBeds = (room: Room, delta: number) => {
    const nextBeds = Math.max(0, Math.min(room.totalBeds, room.availableBeds + delta));
    const nextStatus: RoomStatus =
      room.status === 'Under Maintenance'
        ? nextBeds > 0
          ? 'Available'
          : 'Under Maintenance'
        : nextBeds === 0
        ? 'Full'
        : 'Available';
    onUpdateRoom(room.id, { availableBeds: nextBeds, status: nextStatus });
  };

  const handleSaveRules = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRulesHostel) return;
    const parsedRules = editRulesText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    onUpdateHostel(targetRulesHostel.id, {
      contactPhone: editPhone.trim() || targetRulesHostel.contactPhone,
      description: editDesc.trim() || targetRulesHostel.description,
      rules: parsedRules.length > 0 ? parsedRules : targetRulesHostel.rules,
      photos: editPhotos,
    });
    setRulesSavedNotice(`Updated rules, details, and gallery photos for ${targetRulesHostel.name}.`);
    setTimeout(() => setRulesSavedNotice(null), 4000);
  };

  const handleCreateBatchRooms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addRoomsHostelId) return;
    const qty = Math.max(1, Math.min(40, Number(batchQty) || 1));
    const start = Math.max(1, Number(batchStart) || 101);
    const beds = bedsForOccupancy(batchOcc);
    const existingSet = new Set(
      rooms
        .filter((r) => r.hostelId === addRoomsHostelId)
        .map((r) => r.roomNumber.toLowerCase())
    );

    const newRooms: DraftRoomInput[] = [];
    for (let i = 0; i < qty; i++) {
      const label = `${batchBlock.trim() || 'Block C'} - R${start + i}`;
      if (existingSet.has(label.toLowerCase())) continue;
      newRooms.push({
        tempId: `new-${Date.now()}-${i}`,
        roomNumber: label,
        occupancyType: batchOcc,
        totalBeds: beds,
        annualRentGhs: Math.max(200, Number(batchRent) || 2000),
        utilityDetails: batchUtil.trim() || 'Prepaid ECG meter · Borehole water',
        amenities: ['Wi-Fi', 'Security Fence', 'Study Desk', 'Backup Generator'],
      });
    }

    if (newRooms.length > 0) {
      onAddRoomsToHostel(addRoomsHostelId, newRooms);
    }
    setAddRoomsHostelId(null);
  };

  const handleCreateNewHostel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHostelName.trim() || !newHostelDesc.trim()) return;
    const qty = Math.max(1, Math.min(40, Number(newHostelRoomQty) || 4));
    const beds = bedsForOccupancy(newHostelRoomOcc);
    const draftRooms: DraftRoomInput[] = Array.from({ length: qty }, (_, idx) => ({
      tempId: `hostel-room-${Date.now()}-${idx}`,
      roomNumber: `Block A - R${101 + idx}`,
      occupancyType: newHostelRoomOcc,
      totalBeds: beds,
      annualRentGhs: Math.max(200, Number(newHostelRoomRent) || 2000),
      utilityDetails: 'Prepaid ECG meter · Borehole water supply included',
      amenities: DEFAULT_AMENITIES.slice(0, 5),
    }));

    const rules = newHostelRules
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    onAddHostelForActiveOwner({
      name: newHostelName.trim(),
      campus: newHostelCampus,
      contactPhone: newHostelPhone.trim() || activeOwner.phone || '024 000 0000',
      description: newHostelDesc.trim(),
      rules: rules.length > 0 ? rules : ['Annual tenancy covers two academic semesters.'],
      imageUrl: newHostelPhotos[0]?.url || HOSTEL_IMAGES.royal,
      photos: newHostelPhotos,
      draftRooms,
    });

    setNewHostelName('');
    setNewHostelDesc('');
    setNewHostelPhotos([]);
    setIsAddHostelOpen(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Authenticated Landlord Header & Actions */}
      <section className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center">
        <div>
          <div className="text-xs font-semibold text-[#B45309]">LANDLORD PORTFOLIO CONSOLE</div>
          <h1 className="mt-1 font-display text-2xl font-bold text-slate-900">
            {activeOwner.fullName}
          </h1>
          <p className="mt-0.5 text-xs text-slate-600">
            Managing {ownerHostels.length} hostel{ownerHostels.length === 1 ? '' : 's'} ·{' '}
            <span className="font-mono tabular-nums">{ownerRooms.length} total rooms</span> · Contact:{' '}
            <span className="font-mono">{activeOwner.phone || activeOwner.email}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsAddHostelOpen(true)}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-[#14532D] px-4 py-2 text-xs font-semibold text-white hover:bg-[#166534] whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Hostel</span>
          </button>
        </div>
      </section>

      {ownerHostels.length === 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <Building2 className="mx-auto h-9 w-9 text-[#14532D]" strokeWidth={1.5} />
          <h2 className="mt-3 font-display text-lg font-bold text-slate-900">
            No Hostels Listed Under Your Account Yet
          </h2>
          <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-600">
            Publish your first hostel on Tamale, Nyankpala, City, or Wa Campus. Once added, your rooms appear immediately in the Student Portal for online booking.
          </p>
          <button
            type="button"
            onClick={() => setIsAddHostelOpen(true)}
            className="mt-4 inline-flex min-h-[42px] items-center gap-1.5 rounded-lg bg-[#14532D] px-5 py-2 text-xs font-semibold text-white hover:bg-[#166534]"
          >
            <Plus className="h-4 w-4" />
            <span>List Your First Hostel</span>
          </button>
        </section>
      )}

      {/* 4 Portfolio KPI Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Total Rooms</div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {kpis.totalRooms}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Across {selectedHostelFilter === 'All' ? ownerHostels.length : 1} property
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Occupied Beds</div>
          <div className="mt-2 font-mono text-2xl font-bold text-[#14532D] tabular-nums">
            {kpis.occupiedBeds}
          </div>
          <div className="mt-1 text-xs text-slate-500">Active & reserved bed spaces</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Available Beds Left</div>
          <div className="mt-2 font-mono text-2xl font-bold text-[#B45309] tabular-nums">
            {kpis.availableBeds}
          </div>
          <div className="mt-1 text-xs text-slate-500">Open for instant student booking</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Projected Revenue (Occupied)</div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {formatGhs(kpis.projectedRevenueGhs)}
          </div>
          <div className="mt-1 font-mono text-xs text-slate-500 tabular-nums">
            Full potential: {formatGhs(kpis.maxCapacityRevenueGhs)}
          </div>
        </div>
      </section>

      {/* Scoped Hostel Filter + Section Tabs */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setSelectedHostelFilter('All');
              setPage(1);
            }}
            className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              selectedHostelFilter === 'All'
                ? 'bg-[#14532D] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Hostels ({ownerHostels.length})
          </button>
          {ownerHostels.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => {
                setSelectedHostelFilter(h.id);
                setRulesHostelId(h.id);
                setPage(1);
              }}
              className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                selectedHostelFilter === h.id
                  ? 'bg-[#14532D] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {h.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-1">
          {(
            [
              { id: 'inventory', label: 'Room Inventory' },
              { id: 'rules', label: 'Rules & Photos' },
              { id: 'bookings', label: `Bookings (${ownerBookings.length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-[34px] rounded-md px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: Room Inventory */}
      {activeTab === 'inventory' && (
        <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-5 lg:flex-row lg:items-center">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchRoom}
                  onChange={(e) => {
                    setSearchRoom(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search room number..."
                  className="min-h-[38px] rounded-lg border border-slate-300 pl-9 pr-3 text-xs text-slate-900 focus:border-[#14532D] focus:outline-none"
                />
              </div>

              <select
                value={occupancyFilter}
                onChange={(e) => {
                  setOccupancyFilter(e.target.value as 'All' | OccupancyType);
                  setPage(1);
                }}
                aria-label="Filter by occupancy type"
                className="min-h-[38px] rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800"
              >
                <option value="All">All Occupancy Types</option>
                <option value="1-in-1">1-in-1</option>
                <option value="2-in-1">2-in-1</option>
                <option value="4-in-1">4-in-1</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as 'All' | RoomStatus);
                  setPage(1);
                }}
                aria-label="Filter by room status"
                className="min-h-[38px] rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800"
              >
                <option value="All">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Full">Full</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>
            </div>

            {ownerHostels.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setAddRoomsHostelId(
                    selectedHostelFilter !== 'All'
                      ? selectedHostelFilter
                      : ownerHostels[0].id
                  )
                }
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#14532D] px-3.5 py-1.5 text-xs font-semibold text-[#14532D] hover:bg-[#14532D]/5 whitespace-nowrap self-start lg:self-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Add Rooms to Hostel</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="px-4 py-3 font-semibold">Room</th>
                  <th className="px-4 py-3 font-semibold">Hostel</th>
                  <th className="px-4 py-3 font-semibold">Occupancy</th>
                  <th className="px-4 py-3 font-semibold">Beds Left</th>
                  <th className="px-4 py-3 font-semibold">Annual Rent (GHS)</th>
                  <th className="px-4 py-3 font-semibold">Photos</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleRooms.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                      No rooms match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  visibleRooms.map((room) => {
                    const hostel = hostelMap.get(room.hostelId);
                    const isEditingPrice = editingPriceRoomId === room.id;

                    return (
                      <tr key={room.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                          {room.roomNumber}
                        </td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                          {hostel?.name ?? '—'} · {hostel?.campus ?? ''}
                        </td>
                        <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                          {room.occupancyType}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleAdjustBeds(room, -1)}
                              disabled={room.availableBeds <= 0}
                              aria-label={`Decrease available beds for ${room.roomNumber}`}
                              className="inline-flex h-6 w-6 items-center justify-center rounded border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                            >
                              -
                            </button>
                            <span className="font-mono font-semibold text-slate-900 tabular-nums min-w-[42px] text-center">
                              {room.availableBeds} / {room.totalBeds}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAdjustBeds(room, 1)}
                              disabled={room.availableBeds >= room.totalBeds}
                              aria-label={`Increase available beds for ${room.roomNumber}`}
                              className="inline-flex h-6 w-6 items-center justify-center rounded border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {isEditingPrice ? (
                            <div className="inline-flex items-center gap-1.5">
                              <input
                                type="number"
                                min={100}
                                step={50}
                                value={priceDraft}
                                onChange={(e) => setPriceDraft(e.target.value)}
                                className="w-24 rounded border border-slate-300 px-2 py-1 font-mono text-xs text-slate-900 tabular-nums"
                              />
                              <button
                                type="button"
                                onClick={() => handleSavePrice(room)}
                                aria-label="Save rent price"
                                className="inline-flex h-7 w-7 items-center justify-center rounded bg-[#14532D] text-white"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingPriceRoomId(null)}
                                aria-label="Cancel price edit"
                                className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-300 text-slate-600"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPriceRoomId(room.id);
                                setPriceDraft(String(room.annualRentGhs));
                              }}
                              className="inline-flex items-center gap-1.5 font-mono font-semibold text-slate-900 hover:text-[#14532D] tabular-nums"
                            >
                              <span>{formatGhs(room.annualRentGhs)}</span>
                              <Edit3 className="h-3 w-3 text-slate-400" />
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setEditingPhotosRoomId(room.id)}
                            className="inline-flex min-h-[30px] items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-[#14532D] hover:text-[#14532D]"
                          >
                            <Images className="h-3.5 w-3.5" />
                            <span>
                              {(room.photos?.length ?? 0) > 0
                                ? `Photos (${room.photos?.length})`
                                : 'Add Photos'}
                            </span>
                          </button>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <select
                            value={room.status}
                            onChange={(e) =>
                              handleStatusChange(room, e.target.value as RoomStatus)
                            }
                            aria-label={`Status for ${room.roomNumber}`}
                            className={`min-h-[32px] rounded-md border px-2.5 py-1 text-xs font-semibold ${
                              room.status === 'Available'
                                ? 'border-[#14532D]/30 bg-[#14532D]/10 text-[#14532D]'
                                : room.status === 'Full'
                                ? 'border-red-200 bg-red-50 text-red-800'
                                : 'border-amber-200 bg-amber-50 text-[#92400E]'
                            }`}
                          >
                            <option value="Available">Available</option>
                            <option value="Full">Full</option>
                            <option value="Under Maintenance">Under Maintenance</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 text-xs">
              <span className="text-slate-600 tabular-nums">
                Page {safePage} of {totalPages} ({filteredRooms.length} rooms)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* TAB 2: Hostel Rules & Details */}
      {activeTab === 'rules' && targetRulesHostel && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                Edit Hostel Rules & Contact Details
              </h2>
              <p className="text-xs text-slate-600">
                Changes sync immediately to the Student Portal reservation screen.
              </p>
            </div>
            <select
              value={targetRulesHostel.id}
              onChange={(e) => {
                setRulesHostelId(e.target.value);
                setEditingHostelLoadedId('');
              }}
              className="min-h-[40px] rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-800"
            >
              {ownerHostels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.campus})
                </option>
              ))}
            </select>
          </div>

          {rulesSavedNotice && (
            <div className="rounded-lg border border-[#14532D]/30 bg-[#14532D]/10 px-4 py-2.5 text-xs font-semibold text-[#14532D]">
              {rulesSavedNotice}
            </div>
          )}

          <form onSubmit={handleSaveRules} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="mt-1.5 block w-full min-h-[42px] rounded-lg border border-slate-300 px-3 font-mono text-sm text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Campus Location
                </label>
                <input
                  type="text"
                  disabled
                  value={`${targetRulesHostel.campus} Campus`}
                  className="mt-1.5 block w-full min-h-[42px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Property Description
              </label>
              <textarea
                rows={2}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Tenancy Terms & Hostel Rules (one per line)
              </label>
              <textarea
                rows={5}
                value={editRulesText}
                onChange={(e) => setEditRulesText(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs leading-relaxed text-slate-900"
              />
            </div>

            <PhotoManager photos={editPhotos} onChange={setEditPhotos} />

            <div className="flex justify-end">
              <button
                type="submit"
                className="min-h-[42px] rounded-lg bg-[#14532D] px-5 py-2 text-sm font-semibold text-white hover:bg-[#166534]"
              >
                Save Hostel Details &amp; Photos
              </button>
            </div>
          </form>
        </section>
      )}

      {/* TAB 3: Student Bookings Ledger */}
      {activeTab === 'bookings' && (
        <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-display text-base font-bold text-slate-900">
              Confirmed Reservations ({ownerBookings.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="px-4 py-3 font-semibold">Reference</th>
                  <th className="px-4 py-3 font-semibold">Student</th>
                  <th className="px-4 py-3 font-semibold">UDS ID</th>
                  <th className="px-4 py-3 font-semibold">Hostel & Room</th>
                  <th className="px-4 py-3 font-semibold">Rent</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Check-In</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ownerBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      No reservations recorded yet for your hostels.
                    </td>
                  </tr>
                ) : (
                  ownerBookings.map((b) => {
                    const hostel = hostelMap.get(b.hostelId);
                    const room = ownerRooms.find((r) => r.id === b.roomId);
                    return (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono font-bold text-[#14532D] whitespace-nowrap">
                          {b.referenceCode}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                          {b.studentName}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-700 whitespace-nowrap">
                          {b.studentId}
                        </td>
                        <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                          {hostel?.name ?? '—'} · {room?.roomNumber ?? '—'}
                        </td>
                        <td className="px-4 py-3 font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                          {formatGhs(b.annualRentGhs)}
                        </td>
                        <td className="px-4 py-3 text-slate-500 tabular-nums whitespace-nowrap">
                          {formatShortDate(b.createdAt)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex rounded-md border px-2 py-0.5 font-semibold ${
                              b.checkedIn
                                ? 'border-[#14532D]/30 bg-[#14532D]/10 text-[#14532D]'
                                : 'border-amber-200 bg-amber-50 text-[#92400E]'
                            }`}
                          >
                            {b.checkedIn ? 'Checked In' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Modal: Add Rooms to Existing Hostel */}
      <ModalShell
        isOpen={Boolean(addRoomsHostelId)}
        onClose={() => setAddRoomsHostelId(null)}
        title={`Add Rooms to ${addRoomsHostelId ? hostelMap.get(addRoomsHostelId)?.name ?? 'Hostel' : 'Hostel'}`}
        subtitle="INVENTORY EXPANSION"
        maxWidthClass="max-w-lg"
      >
        <form onSubmit={handleCreateBatchRooms} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Block</label>
                  <input
                    type="text"
                    value={batchBlock}
                    onChange={(e) => setBatchBlock(e.target.value)}
                    className="mt-1 block w-full min-h-[40px] rounded-lg border border-slate-300 px-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Start No.</label>
                  <input
                    type="number"
                    min={1}
                    value={batchStart}
                    onChange={(e) => setBatchStart(Number(e.target.value))}
                    className="mt-1 block w-full min-h-[40px] rounded-lg border border-slate-300 px-3 font-mono text-sm tabular-nums"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700">Room Count</label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={batchQty}
                    onChange={(e) => setBatchQty(Number(e.target.value))}
                    className="mt-1 block w-full min-h-[40px] rounded-lg border border-slate-300 px-3 font-mono text-sm tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Occupancy</label>
                  <select
                    value={batchOcc}
                    onChange={(e) => setBatchOcc(e.target.value as OccupancyType)}
                    className="mt-1 block w-full min-h-[40px] rounded-lg border border-slate-300 bg-white px-3 text-sm"
                  >
                    <option value="1-in-1">1-in-1</option>
                    <option value="2-in-1">2-in-1</option>
                    <option value="4-in-1">4-in-1</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Annual Rent (GHS)</label>
                  <input
                    type="number"
                    min={200}
                    step={50}
                    value={batchRent}
                    onChange={(e) => setBatchRent(Number(e.target.value))}
                    className="mt-1 block w-full min-h-[40px] rounded-lg border border-slate-300 px-3 font-mono text-sm tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Utilities</label>
                <input
                  type="text"
                  value={batchUtil}
                  onChange={(e) => setBatchUtil(e.target.value)}
                  className="mt-1 block w-full min-h-[40px] rounded-lg border border-slate-300 px-3 text-sm"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="min-h-[40px] w-full sm:w-auto rounded-lg bg-[#14532D] px-5 py-2 text-xs font-semibold text-white hover:bg-[#166534]"
                >
                  Add {batchQty} Room{batchQty === 1 ? '' : 's'}
                </button>
              </div>
            </form>
      </ModalShell>

      {/* Modal: Add New Hostel for Active Owner */}
      <ModalShell
        isOpen={isAddHostelOpen}
        onClose={() => setIsAddHostelOpen(false)}
        title="Add New Hostel Property"
        subtitle="NEW HOSTEL LISTING"
        maxWidthClass="max-w-xl"
      >
        <form onSubmit={handleCreateNewHostel} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700">Hostel Name</label>
                  <input
                    type="text"
                    required
                    value={newHostelName}
                    onChange={(e) => setNewHostelName(e.target.value)}
                    placeholder="e.g. Abdul-Karim Nyankpala Annex"
                    className="mt-1 block w-full min-h-[40px] rounded-lg border border-slate-300 px-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Campus</label>
                  <select
                    value={newHostelCampus}
                    onChange={(e) => setNewHostelCampus(e.target.value as CampusLocation)}
                    className="mt-1 block w-full min-h-[40px] rounded-lg border border-slate-300 bg-white px-3 text-sm"
                  >
                    {CAMPUSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={newHostelPhone}
                    onChange={(e) => setNewHostelPhone(e.target.value)}
                    className="mt-1 block w-full min-h-[40px] rounded-lg border border-slate-300 px-3 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Description</label>
                  <input
                    type="text"
                    required
                    value={newHostelDesc}
                    onChange={(e) => setNewHostelDesc(e.target.value)}
                    placeholder="Proximity to campus & key facilities..."
                    className="mt-1 block w-full min-h-[40px] rounded-lg border border-slate-300 px-3 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600">Initial Rooms</label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={newHostelRoomQty}
                    onChange={(e) => setNewHostelRoomQty(Number(e.target.value))}
                    className="mt-1 block w-full min-h-[38px] rounded border border-slate-300 bg-white px-2.5 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">Occupancy</label>
                  <select
                    value={newHostelRoomOcc}
                    onChange={(e) => setNewHostelRoomOcc(e.target.value as OccupancyType)}
                    className="mt-1 block w-full min-h-[38px] rounded border border-slate-300 bg-white px-2 text-xs"
                  >
                    <option value="1-in-1">1-in-1</option>
                    <option value="2-in-1">2-in-1</option>
                    <option value="4-in-1">4-in-1</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">Rent (GHS)</label>
                  <input
                    type="number"
                    min={200}
                    step={50}
                    value={newHostelRoomRent}
                    onChange={(e) => setNewHostelRoomRent(Number(e.target.value))}
                    className="mt-1 block w-full min-h-[38px] rounded border border-slate-300 bg-white px-2.5 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Tenancy Rules (one per line)
                </label>
                <textarea
                  rows={3}
                  value={newHostelRules}
                  onChange={(e) => setNewHostelRules(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <PhotoManager
                compact
                photos={newHostelPhotos}
                onChange={setNewHostelPhotos}
              />

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="min-h-[40px] w-full sm:w-auto rounded-lg bg-[#14532D] px-5 py-2 text-xs font-semibold text-white hover:bg-[#166534]"
                >
                  Publish Hostel
                </button>
              </div>
            </form>
      </ModalShell>

      {/* Modal: Manage Room-Specific Categorized Photos */}
      <ModalShell
        isOpen={Boolean(editingPhotosRoom)}
        onClose={() => setEditingPhotosRoomId(null)}
        title={
          editingPhotosRoom
            ? `Room Photos — ${editingPhotosRoom.roomNumber}`
            : 'Room Photos'
        }
        subtitle={
          editingPhotosRoom
            ? `${hostelMap.get(editingPhotosRoom.hostelId)?.name ?? 'Hostel'} · ${editingPhotosRoom.occupancyType}`
            : undefined
        }
        maxWidthClass="max-w-2xl"
      >
        {editingPhotosRoom && (
          <div className="p-6 space-y-4">
            <p className="text-xs leading-relaxed text-slate-600">
              Add photos specific to <span className="font-semibold text-slate-900">{editingPhotosRoom.roomNumber}</span> (room interior, attached washroom/utilities, or kitchenette). These appear at the top of the student reservation modal alongside your hostel&apos;s shared gallery.
            </p>
            <PhotoManager
              compact
              photos={editingPhotosRoom.photos ?? []}
              onChange={(nextPhotos) =>
                onUpdateRoom(editingPhotosRoom.id, { photos: nextPhotos })
              }
            />
          </div>
        )}
      </ModalShell>
    </div>
  );
};
