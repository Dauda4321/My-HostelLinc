import React, { useMemo, useState } from 'react';
import { CheckCircle2, Search, UserCheck, Wrench } from 'lucide-react';
import {
  BookingRecord,
  Hostel,
  MaintenanceStatus,
  MaintenanceTicket,
  Room,
} from '../types/hostel';
import { formatDateTime, formatGhs, formatShortDate } from '../utils/storage';

interface CaretakerPortalProps {
  hostels: Hostel[];
  rooms: Room[];
  bookings: BookingRecord[];
  tickets: MaintenanceTicket[];
  onConfirmCheckIn: (bookingId: string) => void;
  onUpdateTicketStatus: (ticketId: string, status: MaintenanceStatus) => void;
}

const TICKET_STATUSES: MaintenanceStatus[] = ['Pending', 'In Progress', 'Resolved'];

export const CaretakerPortal: React.FC<CaretakerPortalProps> = ({
  hostels,
  rooms,
  bookings,
  tickets,
  onConfirmCheckIn,
  onUpdateTicketStatus,
}) => {
  const [selectedHostelId, setSelectedHostelId] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'All' | MaintenanceStatus>('All');
  const [activeBookingId, setActiveBookingId] = useState<string | null>(
    bookings[0]?.id ?? null
  );

  const hostelMap = useMemo(() => {
    const map = new Map<string, Hostel>();
    for (const h of hostels) {
      map.set(h.id, h);
    }
    return map;
  }, [hostels]);

  const roomMap = useMemo(() => {
    const map = new Map<string, Room>();
    for (const r of rooms) {
      map.set(r.id, r);
    }
    return map;
  }, [rooms]);

  // Filtered bookings for Student Check-In Verification
  const filteredBookings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return bookings.filter((b) => {
      if (selectedHostelId !== 'All' && b.hostelId !== selectedHostelId) return false;
      if (q) {
        const hay = `${b.referenceCode} ${b.studentId} ${b.studentName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [bookings, selectedHostelId, searchQuery]);

  const inspectedBooking =
    filteredBookings.find((b) => b.id === activeBookingId) ?? filteredBookings[0] ?? null;

  const inspectedHostel = inspectedBooking
    ? hostelMap.get(inspectedBooking.hostelId)
    : undefined;
  const inspectedRoom = inspectedBooking
    ? roomMap.get(inspectedBooking.roomId)
    : undefined;

  // Filtered tickets for Maintenance Issue Tracker
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (selectedHostelId !== 'All' && t.hostelId !== selectedHostelId) return false;
      if (ticketStatusFilter !== 'All' && t.status !== ticketStatusFilter) return false;
      return true;
    });
  }, [tickets, selectedHostelId, ticketStatusFilter]);

  const stats = useMemo(() => {
    const scopedBookings =
      selectedHostelId === 'All'
        ? bookings
        : bookings.filter((b) => b.hostelId === selectedHostelId);
    const scopedTickets =
      selectedHostelId === 'All'
        ? tickets
        : tickets.filter((t) => t.hostelId === selectedHostelId);

    return {
      pendingArrivals: scopedBookings.filter((b) => !b.checkedIn).length,
      checkedInCount: scopedBookings.filter((b) => b.checkedIn).length,
      openTickets: scopedTickets.filter((t) => t.status !== 'Resolved').length,
    };
  }, [bookings, tickets, selectedHostelId]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Caretaker Desk Header + Hostel Selector */}
      <section className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center">
        <div>
          <div className="text-xs font-semibold text-[#B45309]">RESIDENT CARETAKER DESK</div>
          <h1 className="mt-1 font-display text-2xl font-bold text-slate-900">
            Student Check-In & Maintenance Operations
          </h1>
          <p className="mt-1 text-xs text-slate-600">
            Verify student Booking Reference Codes upon arrival and update room maintenance tickets.
          </p>
        </div>

        <div className="flex flex-col gap-1.5 sm:w-72">
          <label htmlFor="caretaker-hostel" className="text-xs font-semibold text-slate-700">
            Active Hostel Scope
          </label>
          <select
            id="caretaker-hostel"
            value={selectedHostelId}
            onChange={(e) => setSelectedHostelId(e.target.value)}
            className="min-h-[42px] rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 focus:border-[#14532D] focus:outline-none"
          >
            <option value="All">All Hostels ({hostels.length})</option>
            {hostels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.campus})
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Summary Metrics Row */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Pending Student Arrivals</div>
          <div className="mt-1.5 font-mono text-2xl font-bold text-[#B45309] tabular-nums">
            {stats.pendingArrivals}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Verified Check-Ins</div>
          <div className="mt-1.5 font-mono text-2xl font-bold text-[#14532D] tabular-nums">
            {stats.checkedInCount}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Active Maintenance Tickets</div>
          <div className="mt-1.5 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {stats.openTickets}
          </div>
        </div>
      </section>

      {/* Workspace 1: Student Check-In Verification */}
      <section
        aria-labelledby="checkin-heading"
        className="rounded-xl border border-slate-200 bg-white overflow-hidden"
      >
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-[#14532D]" />
            <h2 id="checkin-heading" className="font-display text-lg font-bold text-slate-900">
              Student Check-In Verification
            </h2>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Reference (UDS-2026-...) or Student ID"
              className="block w-full min-h-[42px] rounded-lg border border-slate-300 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#14532D] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left List: Matching Reservations */}
          <div className="border-b border-slate-200 lg:col-span-7 lg:border-b-0 lg:border-r">
            {filteredBookings.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No booking records match your search query.
              </div>
            ) : (
              <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100">
                {filteredBookings.map((booking) => {
                  const hostel = hostelMap.get(booking.hostelId);
                  const room = roomMap.get(booking.roomId);
                  const isSelected = inspectedBooking?.id === booking.id;

                  return (
                    <button
                      key={booking.id}
                      type="button"
                      onClick={() => setActiveBookingId(booking.id)}
                      className={`flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors ${
                        isSelected ? 'bg-[#14532D]/5' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono font-bold text-[#14532D]">
                            {booking.referenceCode}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-slate-600">{booking.studentId}</span>
                        </div>
                        <div className="mt-1 truncate text-sm font-semibold text-slate-900">
                          {booking.studentName}
                        </div>
                        <div className="mt-0.5 truncate text-xs text-slate-600">
                          {hostel?.name ?? 'Hostel'} · {room?.roomNumber ?? 'Room'}
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-md border px-2.5 py-1 text-xs font-semibold ${
                          booking.checkedIn
                            ? 'border-[#14532D]/30 bg-[#14532D]/10 text-[#14532D]'
                            : 'border-amber-200 bg-amber-50 text-[#92400E]'
                        }`}
                      >
                        {booking.checkedIn ? 'Checked In' : 'Pending Arrival'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Inspector: Room Assignment & Confirm Check-In */}
          <div className="p-6 lg:col-span-5 bg-slate-50/60">
            {!inspectedBooking ? (
              <div className="flex h-full items-center justify-center py-10 text-sm text-slate-500">
                Select a booking record to inspect room assignment.
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-medium text-slate-500">Booking Reference</div>
                    <div className="mt-0.5 font-mono text-xl font-bold text-[#14532D] tabular-nums">
                      {inspectedBooking.referenceCode}
                    </div>
                  </div>
                  <span
                    className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${
                      inspectedBooking.checkedIn
                        ? 'border-[#14532D]/30 bg-[#14532D]/10 text-[#14532D]'
                        : 'border-amber-200 bg-amber-50 text-[#92400E]'
                    }`}
                  >
                    {inspectedBooking.checkedIn ? 'Arrived & Verified' : 'Pending Check-In'}
                  </span>
                </div>

                <dl className="space-y-2.5 rounded-lg border border-slate-200 bg-white p-4 text-xs">
                  <div className="flex justify-between gap-3 border-b border-slate-100 pb-2">
                    <dt className="text-slate-500">Student Name</dt>
                    <dd className="font-semibold text-slate-900 text-right">
                      {inspectedBooking.studentName}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 border-b border-slate-100 pb-2">
                    <dt className="text-slate-500">UDS Student ID</dt>
                    <dd className="font-mono font-semibold text-slate-900 text-right">
                      {inspectedBooking.studentId}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 border-b border-slate-100 pb-2">
                    <dt className="text-slate-500">Programme / Level</dt>
                    <dd className="font-medium text-slate-900 text-right">
                      {inspectedBooking.programmeLevel}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 border-b border-slate-100 pb-2">
                    <dt className="text-slate-500">Phone</dt>
                    <dd className="font-mono text-slate-900 text-right">
                      {inspectedBooking.studentPhone}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 border-b border-slate-100 pb-2">
                    <dt className="text-slate-500">Assigned Hostel</dt>
                    <dd className="font-semibold text-slate-900 text-right">
                      {inspectedHostel?.name ?? '—'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 border-b border-slate-100 pb-2">
                    <dt className="text-slate-500">Room Assignment</dt>
                    <dd className="font-semibold text-[#14532D] text-right">
                      {inspectedRoom?.roomNumber ?? '—'} ({inspectedRoom?.occupancyType ?? ''})
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Annual Rent</dt>
                    <dd className="font-mono font-semibold text-slate-900 text-right tabular-nums">
                      {formatGhs(inspectedBooking.annualRentGhs)}
                    </dd>
                  </div>
                </dl>

                {inspectedBooking.checkedIn ? (
                  <div className="flex items-center gap-2 rounded-lg border border-[#14532D]/30 bg-[#14532D]/10 px-4 py-3 text-xs font-semibold text-[#14532D]">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>
                      Checked in on{' '}
                      {inspectedBooking.checkedInAt
                        ? formatDateTime(inspectedBooking.checkedInAt)
                        : 'Verified'}
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onConfirmCheckIn(inspectedBooking.id)}
                    className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-[#14532D] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#166534]"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Confirm Check-In</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Workspace 2: Maintenance Issue Tracker */}
      <section
        aria-labelledby="maintenance-heading"
        className="rounded-xl border border-slate-200 bg-white overflow-hidden"
      >
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-[#B45309]" />
            <div>
              <h2 id="maintenance-heading" className="font-display text-lg font-bold text-slate-900">
                Maintenance Issue Tracker
              </h2>
              <p className="text-xs text-slate-500">
                Student-reported room faults synced in real time across portals.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 p-1">
            {(['All', ...TICKET_STATUSES] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setTicketStatusFilter(status)}
                className={`min-h-[34px] rounded-md px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                  ticketStatusFilter === status
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredTickets.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No maintenance tickets under this filter.
            </div>
          ) : (
            filteredTickets.map((ticket) => {
              const hostel = hostelMap.get(ticket.hostelId);
              return (
                <div
                  key={ticket.id}
                  className="flex flex-col justify-between gap-4 p-5 lg:flex-row lg:items-center"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-900">
                        {hostel?.name ?? 'Hostel'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-[#14532D]">{ticket.roomNumber}</span>
                      <span aria-hidden="true">·</span>
                      <span>{ticket.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">Reported {formatShortDate(ticket.createdAt)}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-900">{ticket.description}</p>
                    <div className="text-xs text-slate-500">
                      Submitted by {ticket.reportedBy} (
                      <span className="font-mono">{ticket.studentId}</span>)
                    </div>
                  </div>

                  {/* Interactive Status Toggle Buttons */}
                  <div
                    role="group"
                    aria-label={`Set status for ${ticket.roomNumber} ticket`}
                    className="flex flex-wrap items-center gap-1.5 shrink-0"
                  >
                    {TICKET_STATUSES.map((status) => {
                      const active = ticket.status === status;
                      let activeClass = 'bg-slate-900 text-white border-slate-900';
                      if (active && status === 'Pending') {
                        activeClass = 'bg-amber-600 text-white border-amber-600';
                      } else if (active && status === 'In Progress') {
                        activeClass = 'bg-[#B45309] text-white border-[#B45309]';
                      } else if (active && status === 'Resolved') {
                        activeClass = 'bg-[#14532D] text-white border-[#14532D]';
                      }

                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => onUpdateTicketStatus(ticket.id, status)}
                          className={`min-h-[36px] rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                            active
                              ? activeClass
                              : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {status}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};
