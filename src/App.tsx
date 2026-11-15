import { useEffect, useState } from 'react';
import { Lock, Mail, RotateCcw, X } from 'lucide-react';
import {
  AppState,
  BookingRecord,
  CampusLocation,
  Hostel,
  HostelPhoto,
  MaintenanceCategory,
  MaintenanceStatus,
  MaintenanceTicket,
  PortalRole,
  Room,
  UserAccount,
} from './types/hostel';
import { createSeedPhotosForHostel } from './data/seedData';
import {
  generateBookingCode,
  loadAppState,
  resetAppState,
  saveAppState,
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { StudentPortal } from './components/StudentPortal';
import { LandlordPortal } from './components/LandlordPortal';
import { CaretakerPortal } from './components/CaretakerPortal';
import { DraftRoomInput } from './components/LandlordRegistrationModal';
import { BookingSlipModal } from './components/BookingSlipModal';
import { AuthModal, AuthModalInitialTab } from './components/AuthModal';
import { AccountSecurityModal } from './components/AccountSecurityModal';

interface SimulatedOtpToast {
  contact: string;
  code: string;
}

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => loadAppState());
  const [activeRole, setActiveRole] = useState<PortalRole>('student');
  const [activeSlipBooking, setActiveSlipBooking] = useState<BookingRecord | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  // Auth & Security modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<AuthModalInitialTab>('login');
  const [authInitialSignUpRole, setAuthInitialSignUpRole] = useState<'student' | 'landlord'>('student');
  const [authContextMessage, setAuthContextMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<'none' | 'booking' | 'landlord' | 'caretaker'>('none');
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [otpToast, setOtpToast] = useState<SimulatedOtpToast | null>(null);

  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  const currentUser: UserAccount | null =
    appState.users.find((u) => u.id === appState.currentUserId) ?? null;

  const openAuthModal = (options?: {
    tab?: AuthModalInitialTab;
    signUpRole?: 'student' | 'landlord';
    contextMessage?: string | null;
    pending?: 'none' | 'booking' | 'landlord' | 'caretaker';
  }) => {
    setAuthInitialTab(options?.tab ?? 'login');
    setAuthInitialSignUpRole(options?.signUpRole ?? 'student');
    setAuthContextMessage(options?.contextMessage ?? null);
    setPendingAction(options?.pending ?? 'none');
    setAuthModalOpen(true);
  };

  const handleSelectRole = (role: PortalRole) => {
    if (role === 'student') {
      setActiveRole('student');
      return;
    }

    if (!currentUser) {
      openAuthModal({
        tab: 'login',
        signUpRole: role === 'landlord' ? 'landlord' : 'student',
        contextMessage:
          role === 'landlord'
            ? 'Sign in with a Hostel Owner / Landlord account to manage hostels and rooms.'
            : 'Sign in with a Caretaker / Hostel Manager account to verify check-ins and track maintenance.',
        pending: role,
      });
      return;
    }

    setActiveRole(role);
  };

  const handleLoginSuccess = (user: UserAccount) => {
    setAppState((prev) => ({
      ...prev,
      currentUserId: user.id,
      activeLandlordId: user.role === 'landlord' ? user.id : prev.activeLandlordId,
    }));
    setAuthModalOpen(false);
    setAuthContextMessage(null);

    if (pendingAction === 'booking') {
      setActiveRole('student');
    } else if (pendingAction === 'landlord' && user.role === 'landlord') {
      setActiveRole('landlord');
    } else if (pendingAction === 'caretaker' && user.role === 'caretaker') {
      setActiveRole('caretaker');
    } else if (user.role === 'landlord') {
      setActiveRole('landlord');
    } else if (user.role === 'caretaker') {
      setActiveRole('caretaker');
    } else {
      setActiveRole('student');
    }
    setPendingAction('none');
  };

  const handleRegisterUser = (
    payload: Omit<UserAccount, 'id' | 'createdAt'>
  ): UserAccount => {
    const now = new Date().toISOString();
    const id = `${payload.role}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newUser: UserAccount = {
      ...payload,
      id,
      createdAt: now,
    };

    setAppState((prev) => ({
      ...prev,
      users: [...prev.users, newUser],
      landlords:
        payload.role === 'landlord'
          ? [
              ...prev.landlords,
              {
                id,
                fullName: payload.fullName,
                contact: payload.phone || payload.email,
                password: payload.password,
                createdAt: now,
              },
            ]
          : prev.landlords,
    }));

    return newUser;
  };

  const handleUpdateUserPassword = (userId: string, newPassword: string) => {
    setAppState((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === userId ? { ...u, password: newPassword } : u
      ),
      landlords: prev.landlords.map((l) =>
        l.id === userId ? { ...l, password: newPassword } : l
      ),
    }));
  };

  const handleLogout = () => {
    setAppState((prev) => ({
      ...prev,
      currentUserId: null,
    }));
    setSecurityModalOpen(false);
    setActiveRole('student');
  };

  const handleShowSimulatedOtpToast = (contact: string, code: string) => {
    setOtpToast({ contact, code });
  };

  const handleCreateBooking = (payload: {
    roomId: string;
    hostelId: string;
    studentName: string;
    studentId: string;
    studentPhone: string;
    programmeLevel: string;
    acceptedTerms: boolean;
  }): BookingRecord => {
    const targetRoom = appState.rooms.find((r) => r.id === payload.roomId);
    const referenceCode = generateBookingCode(
      appState.bookings.map((b) => b.referenceCode)
    );

    const newBooking: BookingRecord = {
      id: `booking-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      referenceCode,
      hostelId: payload.hostelId,
      roomId: payload.roomId,
      userId: currentUser?.id,
      studentName: payload.studentName,
      studentId: payload.studentId,
      studentPhone: payload.studentPhone,
      programmeLevel: payload.programmeLevel,
      annualRentGhs: targetRoom?.annualRentGhs ?? 0,
      acceptedTerms: payload.acceptedTerms,
      createdAt: new Date().toISOString(),
      checkedIn: false,
    };

    setAppState((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room) => {
        if (room.id !== payload.roomId) return room;
        const nextBeds = Math.max(0, room.availableBeds - 1);
        return {
          ...room,
          availableBeds: nextBeds,
          status: nextBeds === 0 ? 'Full' : room.status,
        };
      }),
      bookings: [newBooking, ...prev.bookings],
    }));

    return newBooking;
  };

  const handleSubmitMaintenanceIssue = (payload: {
    hostelId: string;
    roomNumber: string;
    category: MaintenanceCategory;
    description: string;
    reportedBy: string;
    studentId: string;
  }) => {
    const now = new Date().toISOString();
    const newTicket: MaintenanceTicket = {
      id: `ticket-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      hostelId: payload.hostelId,
      roomNumber: payload.roomNumber,
      category: payload.category,
      description: payload.description,
      reportedBy: payload.reportedBy,
      studentId: payload.studentId,
      status: 'Pending',
      createdAt: now,
      updatedAt: now,
    };

    setAppState((prev) => ({
      ...prev,
      tickets: [newTicket, ...prev.tickets],
    }));
  };

  const handleUpdateRoom = (
    roomId: string,
    updates: Partial<Pick<Room, 'annualRentGhs' | 'status' | 'availableBeds' | 'photos'>>
  ) => {
    setAppState((prev) => ({
      ...prev,
      rooms: prev.rooms.map((r) => (r.id === roomId ? { ...r, ...updates } : r)),
    }));
  };

  const handleUpdateHostel = (
    hostelId: string,
    updates: Partial<
      Pick<Hostel, 'name' | 'contactPhone' | 'description' | 'rules' | 'photos' | 'imageUrl'>
    >
  ) => {
    setAppState((prev) => ({
      ...prev,
      hostels: prev.hostels.map((h) => (h.id === hostelId ? { ...h, ...updates } : h)),
    }));
  };

  const handleAddHostelForActiveOwner = (payload: {
    name: string;
    campus: CampusLocation;
    contactPhone: string;
    description: string;
    rules: string[];
    imageUrl: string;
    photos?: HostelPhoto[];
    draftRooms: DraftRoomInput[];
  }) => {
    if (!currentUser || currentUser.role !== 'landlord') return;

    const hostelId = `hostel-${Date.now()}`;
    const uploadedPhotos = payload.photos && payload.photos.length > 0 ? payload.photos : [];
    const newHostel: Hostel = {
      id: hostelId,
      ownerId: currentUser.id,
      name: payload.name,
      ownerName: currentUser.fullName,
      campus: payload.campus,
      contactPhone: payload.contactPhone,
      description: payload.description,
      rules: payload.rules,
      imageUrl: uploadedPhotos[0]?.url || payload.imageUrl,
      photos:
        uploadedPhotos.length > 0 ? uploadedPhotos : createSeedPhotosForHostel(hostelId),
      createdAt: new Date().toISOString(),
    };

    const newRooms: Room[] = payload.draftRooms.map((dr, idx) => ({
      id: `${hostelId}-room-${idx + 1}-${Date.now()}`,
      hostelId,
      roomNumber: dr.roomNumber,
      occupancyType: dr.occupancyType,
      totalBeds: dr.totalBeds,
      availableBeds: dr.totalBeds,
      annualRentGhs: dr.annualRentGhs,
      status: 'Available',
      utilityDetails: dr.utilityDetails,
      amenities: dr.amenities,
    }));

    setAppState((prev) => ({
      ...prev,
      hostels: [...prev.hostels, newHostel],
      rooms: [...prev.rooms, ...newRooms],
    }));
  };

  const handleAddRoomsToHostel = (hostelId: string, draftRooms: DraftRoomInput[]) => {
    const newRooms: Room[] = draftRooms.map((dr, idx) => ({
      id: `${hostelId}-room-added-${Date.now()}-${idx}`,
      hostelId,
      roomNumber: dr.roomNumber,
      occupancyType: dr.occupancyType,
      totalBeds: dr.totalBeds,
      availableBeds: dr.totalBeds,
      annualRentGhs: dr.annualRentGhs,
      status: 'Available',
      utilityDetails: dr.utilityDetails,
      amenities: dr.amenities,
    }));

    setAppState((prev) => ({
      ...prev,
      rooms: [...prev.rooms, ...newRooms],
    }));
  };

  const handleConfirmCheckIn = (bookingId: string) => {
    const now = new Date().toISOString();
    setAppState((prev) => ({
      ...prev,
      bookings: prev.bookings.map((b) =>
        b.id === bookingId ? { ...b, checkedIn: true, checkedInAt: now } : b
      ),
    }));
  };

  const handleUpdateTicketStatus = (ticketId: string, status: MaintenanceStatus) => {
    const now = new Date().toISOString();
    setAppState((prev) => ({
      ...prev,
      tickets: prev.tickets.map((t) =>
        t.id === ticketId ? { ...t, status, updatedAt: now } : t
      ),
    }));
  };

  const handleResetDemoData = () => {
    const fresh = resetAppState();
    setAppState(fresh);
    setConfirmReset(false);
    setActiveSlipBooking(null);
    setActiveRole('student');
    setOtpToast(null);
  };

  const slipHostel = activeSlipBooking
    ? appState.hostels.find((h) => h.id === activeSlipBooking.hostelId)
    : undefined;
  const slipRoom = activeSlipBooking
    ? appState.rooms.find((r) => r.id === activeSlipBooking.roomId)
    : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9F8] text-slate-900">
      <Navbar
        activeRole={activeRole}
        currentUser={currentUser}
        onSelectRole={handleSelectRole}
        onOpenAuthModal={() =>
          openAuthModal({ tab: 'login', pending: 'none', contextMessage: null })
        }
        onOpenAccountSecurity={() => setSecurityModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Simulated SMS / Email OTP Toast Notification */}
      {otpToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-[60] w-full max-w-sm rounded-xl border border-[#14532D]/30 bg-white p-4 shadow-xl no-print"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#14532D]/10 text-[#14532D]">
                <Mail className="h-4 w-4" />
              </div>
              <div className="text-xs leading-relaxed text-slate-700">
                <div className="font-bold text-slate-900">Simulated SMS / Email Delivery</div>
                <p className="mt-0.5">
                  Simulated SMS/Email to{' '}
                  <span className="font-semibold text-slate-900">{otpToast.contact}</span>: Your UDS Hostel reset code is{' '}
                  <span className="font-mono text-sm font-bold text-[#14532D]">{otpToast.code}</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOtpToast(null)}
              aria-label="Dismiss code notification"
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <main className="flex-1">
        {activeRole === 'student' && (
          <StudentPortal
            currentUser={currentUser}
            hostels={appState.hostels}
            rooms={appState.rooms}
            bookings={appState.bookings}
            onRequireAuthForBooking={() =>
              openAuthModal({
                tab: 'login',
                signUpRole: 'student',
                contextMessage:
                  'Please log in or create a Student account to complete your room reservation.',
                pending: 'booking',
              })
            }
            onCreateBooking={handleCreateBooking}
            onViewBookingSlip={(booking) => setActiveSlipBooking(booking)}
            onSubmitMaintenanceIssue={handleSubmitMaintenanceIssue}
          />
        )}

        {activeRole === 'landlord' && (
          currentUser?.role === 'landlord' ? (
            <LandlordPortal
              currentUser={currentUser}
              hostels={appState.hostels}
              rooms={appState.rooms}
              bookings={appState.bookings}
              onUpdateRoom={handleUpdateRoom}
              onUpdateHostel={handleUpdateHostel}
              onAddHostelForActiveOwner={handleAddHostelForActiveOwner}
              onAddRoomsToHostel={handleAddRoomsToHostel}
            />
          ) : (
            <div className="mx-auto max-w-xl px-4 py-16">
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#14532D]/10 text-[#14532D]">
                  <Lock className="h-6 w-6" />
                </div>
                <h1 className="font-display text-xl font-bold text-slate-900">
                  Landlord Portal Access Required
                </h1>
                <p className="text-sm text-slate-600">
                  {currentUser
                    ? `You are currently logged in as ${currentUser.fullName} (${currentUser.role}). Sign in with a Landlord / Hostel Owner account to manage hostels and room inventory.`
                    : 'Please log in or register a Hostel Owner account to manage hostels, room prices, and occupancy.'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      openAuthModal({
                        tab: 'login',
                        signUpRole: 'landlord',
                        contextMessage:
                          'Log in with a Landlord account (e.g. abdulkarim@udshostels.com) or sign up as a Hostel Owner.',
                        pending: 'landlord',
                      })
                    }
                    className="min-h-[42px] rounded-lg bg-[#14532D] px-5 py-2 text-xs font-semibold text-white hover:bg-[#166534]"
                  >
                    Log In / Register as Landlord
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveRole('student')}
                    className="min-h-[42px] rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Back to Student Portal
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        {activeRole === 'caretaker' && (
          currentUser?.role === 'caretaker' ? (
            <CaretakerPortal
              hostels={appState.hostels}
              rooms={appState.rooms}
              bookings={appState.bookings}
              tickets={appState.tickets}
              onConfirmCheckIn={handleConfirmCheckIn}
              onUpdateTicketStatus={handleUpdateTicketStatus}
            />
          ) : (
            <div className="mx-auto max-w-xl px-4 py-16">
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#14532D]/10 text-[#14532D]">
                  <Lock className="h-6 w-6" />
                </div>
                <h1 className="font-display text-xl font-bold text-slate-900">
                  Caretaker Portal Access Required
                </h1>
                <p className="text-sm text-slate-600">
                  {currentUser
                    ? `You are currently logged in as ${currentUser.fullName} (${currentUser.role}). Sign in with a Caretaker / Hostel Manager account to verify student check-ins and resolve maintenance tickets.`
                    : 'Please log in with a Caretaker / Hostel Manager account to access check-in verification and maintenance tracking.'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      openAuthModal({
                        tab: 'login',
                        contextMessage:
                          'Log in with a Caretaker account (e.g. manager@udshostels.com) to access the Caretaker Desk.',
                        pending: 'caretaker',
                      })
                    }
                    className="min-h-[42px] rounded-lg bg-[#14532D] px-5 py-2 text-xs font-semibold text-white hover:bg-[#166534]"
                  >
                    Log In as Caretaker
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveRole('student')}
                    className="min-h-[42px] rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Back to Student Portal
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </main>

      {/* Clean Academic Footer with Reset Demo Data Action */}
      <footer className="border-t border-slate-200 bg-white no-print">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="text-xs text-slate-600">
            <span className="font-semibold text-[#14532D]">UDS HostelHub</span>
            <span className="mx-2 text-slate-300" aria-hidden="true">
              ·
            </span>
            <span>
              Student Accommodation Directory for Tamale, Nyankpala, City &amp; Wa Campuses
            </span>
          </div>

          <div className="flex items-center gap-2">
            {confirmReset ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600">Restore initial data &amp; accounts?</span>
                <button
                  type="button"
                  onClick={handleResetDemoData}
                  className="min-h-[34px] rounded-lg bg-red-700 px-3 py-1 text-xs font-semibold text-white hover:bg-red-800"
                >
                  Confirm Reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="min-h-[34px] rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Demo Data</span>
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Auth, Security & Booking Slip Modals */}
      <AuthModal
        isOpen={authModalOpen}
        initialTab={authInitialTab}
        initialSignUpRole={authInitialSignUpRole}
        contextMessage={authContextMessage}
        users={appState.users}
        onClose={() => {
          setAuthModalOpen(false);
          setPendingAction('none');
          setAuthContextMessage(null);
        }}
        onLoginSuccess={handleLoginSuccess}
        onRegisterUser={handleRegisterUser}
        onResetUserPassword={handleUpdateUserPassword}
        onShowSimulatedOtpToast={handleShowSimulatedOtpToast}
      />

      <AccountSecurityModal
        isOpen={securityModalOpen}
        user={currentUser}
        onClose={() => setSecurityModalOpen(false)}
        onChangePassword={handleUpdateUserPassword}
      />

      <BookingSlipModal
        booking={activeSlipBooking}
        hostel={slipHostel}
        room={slipRoom}
        onClose={() => setActiveSlipBooking(null)}
      />
    </div>
  );
}
