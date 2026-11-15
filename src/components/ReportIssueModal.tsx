import React, { useState } from 'react';
import { Hostel, MaintenanceCategory, Room } from '../types/hostel';
import { ModalShell } from './ModalShell';

interface ReportIssueModalProps {
  isOpen: boolean;
  hostels: Hostel[];
  rooms: Room[];
  onClose: () => void;
  onSubmitIssue: (payload: {
    hostelId: string;
    roomNumber: string;
    category: MaintenanceCategory;
    description: string;
    reportedBy: string;
    studentId: string;
  }) => void;
}

const CATEGORIES: MaintenanceCategory[] = [
  'Plumbing',
  'Electrical',
  'Ceiling Fan',
  'Carpentry & Locks',
  'Water Supply',
  'Wi-Fi & Network',
  'Other',
];

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  isOpen,
  hostels,
  rooms,
  onClose,
  onSubmitIssue,
}) => {
  const [hostelId, setHostelId] = useState(hostels[0]?.id ?? '');
  const hostelRooms = rooms.filter((r) => r.hostelId === hostelId);
  const [roomNumber, setRoomNumber] = useState(hostelRooms[0]?.roomNumber ?? '');
  const [category, setCategory] = useState<MaintenanceCategory>('Plumbing');
  const [reportedBy, setReportedBy] = useState('');
  const [studentId, setStudentId] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleHostelChange = (newHostelId: string) => {
    setHostelId(newHostelId);
    const matchingRooms = rooms.filter((r) => r.hostelId === newHostelId);
    setRoomNumber(matchingRooms[0]?.roomNumber ?? '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!hostelId || !roomNumber.trim() || !reportedBy.trim() || !studentId.trim() || !description.trim()) {
      setError('Please complete all fields to dispatch a maintenance ticket to the caretaker.');
      return;
    }

    onSubmitIssue({
      hostelId,
      roomNumber: roomNumber.trim(),
      category,
      description: description.trim(),
      reportedBy: reportedBy.trim(),
      studentId: studentId.trim().toUpperCase(),
    });

    setReportedBy('');
    setStudentId('');
    setDescription('');
    onClose();
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Report Room Maintenance Issue"
      subtitle="CARETAKER DISPATCH TICKET"
      titleId="report-issue-title"
      maxWidthClass="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <p className="text-xs text-slate-600">
          Submitted tickets appear immediately in the Caretaker Portal’s Maintenance Issue Tracker.
        </p>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-800">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="issue-hostel" className="block text-xs font-semibold text-slate-700">
              Hostel
            </label>
            <select
              id="issue-hostel"
              value={hostelId}
              onChange={(e) => handleHostelChange(e.target.value)}
              className="mt-1.5 block w-full min-h-[42px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#14532D] focus:outline-none"
            >
              {hostels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="issue-room" className="block text-xs font-semibold text-slate-700">
              Room Number
            </label>
            {hostelRooms.length > 0 ? (
              <select
                id="issue-room"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="mt-1.5 block w-full min-h-[42px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#14532D] focus:outline-none"
              >
                {hostelRooms.map((r) => (
                  <option key={r.id} value={r.roomNumber}>
                    {r.roomNumber} ({r.occupancyType})
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="issue-room"
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. Block A - R101"
                className="mt-1.5 block w-full min-h-[42px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="issue-cat" className="block text-xs font-semibold text-slate-700">
              Issue Category
            </label>
            <select
              id="issue-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value as MaintenanceCategory)}
              className="mt-1.5 block w-full min-h-[42px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#14532D] focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="issue-sid" className="block text-xs font-semibold text-slate-700">
              UDS Student ID
            </label>
            <input
              id="issue-sid"
              type="text"
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="e.g. UDS/MD/0284/24"
              className="mt-1.5 block w-full min-h-[42px] rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 placeholder:font-sans placeholder:text-slate-400 focus:border-[#14532D] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="issue-name" className="block text-xs font-semibold text-slate-700">
            Reported By (Student Name)
          </label>
          <input
            id="issue-name"
            type="text"
            required
            value={reportedBy}
            onChange={(e) => setReportedBy(e.target.value)}
            placeholder="e.g. Abdulai Sadia"
            className="mt-1.5 block w-full min-h-[42px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#14532D] focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="issue-desc" className="block text-xs font-semibold text-slate-700">
            Fault Description
          </label>
          <textarea
            id="issue-desc"
            rows={3}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the plumbing, electrical, fan, or lock issue..."
            className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#14532D] focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            className="min-h-[42px] w-full sm:w-auto rounded-lg bg-[#14532D] px-5 py-2 text-sm font-semibold text-white hover:bg-[#166534]"
          >
            Submit Issue Ticket
          </button>
        </div>
      </form>
    </ModalShell>
  );
};
