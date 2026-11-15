import React from 'react';
import { Printer } from 'lucide-react';
import { BookingRecord, Hostel, Room } from '../types/hostel';
import { formatDateTime, formatGhs } from '../utils/storage';
import { ModalShell } from './ModalShell';

interface BookingSlipModalProps {
  booking: BookingRecord | null;
  hostel: Hostel | undefined;
  room: Room | undefined;
  onClose: () => void;
}

export const BookingSlipModal: React.FC<BookingSlipModalProps> = ({
  booking,
  hostel,
  room,
  onClose,
}) => {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <ModalShell
      isOpen={Boolean(booking)}
      onClose={onClose}
      title={hostel?.name ?? 'Booking Confirmation Slip'}
      subtitle="RESERVATION CONFIRMED · PRINTABLE SLIP"
      titleId="booking-slip-title"
      maxWidthClass="max-w-2xl"
      headerActions={
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-[#14532D] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#166534] whitespace-nowrap"
        >
          <Printer className="h-3.5 w-3.5" />
          <span>Print Slip</span>
        </button>
      }
      footerExtra={
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#14532D] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#166534] whitespace-nowrap"
        >
          <Printer className="h-4 w-4" />
          <span>Print Booking Slip</span>
        </button>
      }
    >
      {/* Printable Booking Slip Body */}
      <div id="printable-booking-slip" className="p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#B45309]">
              UNIVERSITY FOR DEVELOPMENT STUDIES · ACCOMMODATION SLIP
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold text-slate-900">
              {hostel?.name ?? 'Registered UDS Hostel'}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {hostel?.campus ?? 'Tamale'} Campus · Managed by {hostel?.ownerName ?? 'Hostel Owner'}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-left sm:text-right">
            <div className="text-xs font-medium text-slate-500">Booking Reference</div>
            <div className="mt-0.5 font-mono text-lg font-bold text-[#14532D] tabular-nums">
              {booking.referenceCode}
            </div>
            <div className="mt-1 text-xs font-medium text-slate-600">
              {booking.checkedIn ? 'Checked In' : 'Pending Check-In'}
            </div>
          </div>
        </div>

        {/* Student & Allocation Grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold text-slate-500">Student Particulars</h3>
            <dl className="mt-3 space-y-2.5 text-sm">
              <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                <dt className="text-slate-500">Full Name</dt>
                <dd className="font-medium text-slate-900 text-right">{booking.studentName}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                <dt className="text-slate-500">UDS Student ID</dt>
                <dd className="font-mono font-medium text-slate-900 text-right tabular-nums">
                  {booking.studentId}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                <dt className="text-slate-500">Programme / Level</dt>
                <dd className="font-medium text-slate-900 text-right">{booking.programmeLevel}</dd>
              </div>
              <div className="flex justify-between gap-4 pb-1">
                <dt className="text-slate-500">Phone Number</dt>
                <dd className="font-mono font-medium text-slate-900 text-right tabular-nums">
                  {booking.studentPhone}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-500">Room Allocation</h3>
            <dl className="mt-3 space-y-2.5 text-sm">
              <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                <dt className="text-slate-500">Room Number</dt>
                <dd className="font-semibold text-slate-900 text-right">
                  {room?.roomNumber ?? 'Assigned Room'}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                <dt className="text-slate-500">Occupancy Type</dt>
                <dd className="font-medium text-slate-900 text-right">
                  {room?.occupancyType ?? 'Standard'} (1 Bed Space Reserved)
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                <dt className="text-slate-500">Annual Rent</dt>
                <dd className="font-mono font-semibold text-[#14532D] text-right tabular-nums">
                  {formatGhs(booking.annualRentGhs)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 pb-1">
                <dt className="text-slate-500">Hostel Contact</dt>
                <dd className="font-mono font-medium text-slate-900 text-right tabular-nums">
                  {hostel?.contactPhone ?? '—'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Utility & Verification Footer */}
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 space-y-1.5">
          <div className="font-semibold text-slate-800">Check-In Verification Instructions</div>
          <p>
            Present this Booking Reference Code (<span className="font-mono font-semibold text-slate-900">{booking.referenceCode}</span>) and your valid UDS Student ID at the hostel caretaker desk upon arrival. No online payment was processed on this portal; direct tenancy settlement follows hostel management guidelines.
          </p>
          <div className="pt-1 text-slate-500 tabular-nums">
            Issued on {formatDateTime(booking.createdAt)} · Tenancy Terms Accepted
          </div>
        </div>
      </div>
    </ModalShell>
  );
};
