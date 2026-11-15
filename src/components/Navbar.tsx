import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, Menu, ShieldCheck, User, X } from 'lucide-react';
import { PortalRole, UserAccount } from '../types/hostel';

interface NavbarProps {
  activeRole: PortalRole;
  currentUser: UserAccount | null;
  onSelectRole: (role: PortalRole) => void;
  onOpenAuthModal: () => void;
  onOpenAccountSecurity: () => void;
  onLogout: () => void;
}

const ROLE_LINKS: Array<{ id: PortalRole; label: string }> = [
  { id: 'student', label: 'Student Portal' },
  { id: 'landlord', label: 'Landlord Portal' },
  { id: 'caretaker', label: 'Caretaker Portal' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeRole,
  currentUser,
  onSelectRole,
  onOpenAuthModal,
  onOpenAccountSecurity,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleClick = (role: PortalRole) => {
    onSelectRole(role);
    setMobileMenuOpen(false);
  };

  const roleBadgeText =
    currentUser?.role === 'landlord'
      ? 'Landlord'
      : currentUser?.role === 'caretaker'
      ? 'Caretaker'
      : 'Student';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm no-print">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleRoleClick('student')}
          className="font-display text-lg font-bold tracking-tight text-[#14532D] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#14532D]"
        >
          UDS HostelHub
        </button>

        {/* Zone 2: Clean Single-Line Portal Links (Desktop) */}
        <nav
          aria-label="Portal Navigation"
          className="hidden md:flex items-center gap-7"
        >
          {ROLE_LINKS.map((item) => {
            const isActive = activeRole === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleRoleClick(item.id)}
                className={`relative py-2 text-sm font-medium transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#14532D] ${
                  isActive
                    ? 'text-[#14532D] font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[17px] h-0.5 bg-[#14532D]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Auth Action or Profile Menu + Mobile Menu Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          {!currentUser ? (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuthModal();
              }}
              className="hidden sm:inline-flex items-center justify-center rounded-lg bg-[#14532D] px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-[#166534] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14532D]"
            >
              Log In / Sign Up
            </button>
          ) : (
            <div ref={dropdownRef} className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                aria-expanded={profileMenuOpen}
                aria-haspopup="menu"
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0"
              >
                <User className="h-4 w-4 text-[#14532D] shrink-0" />
                <span className="max-w-[140px] truncate">{currentUser.fullName}</span>
                <span className="text-[#B45309] font-medium">· {roleBadgeText}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              </button>

              {profileMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-60 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg z-50"
                >
                  <div className="border-b border-slate-100 px-4 py-2.5">
                    <div className="truncate text-xs font-bold text-slate-900">
                      {currentUser.fullName}
                    </div>
                    <div className="truncate text-[11px] text-slate-500">
                      {currentUser.email || currentUser.phone}
                    </div>
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      onOpenAccountSecurity();
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <ShieldCheck className="h-4 w-4 text-[#14532D]" />
                    <span>Account &amp; Security</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      onLogout();
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs font-medium text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {ROLE_LINKS.map((item) => {
              const isActive = activeRole === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleRoleClick(item.id)}
                  className={`flex min-h-[44px] items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#14532D]/10 text-[#14532D] font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="text-xs text-[#14532D]">Active</span>}
                </button>
              );
            })}

            {!currentUser ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuthModal();
                }}
                className="mt-2 flex min-h-[44px] w-full items-center justify-center rounded-lg bg-[#14532D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#166534] sm:hidden"
              >
                Log In / Sign Up
              </button>
            ) : (
              <div className="mt-2 border-t border-slate-100 pt-2 space-y-1 sm:hidden">
                <div className="px-3 py-1.5 text-xs font-semibold text-slate-900">
                  {currentUser.fullName} · <span className="text-[#B45309]">{roleBadgeText}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAccountSecurity();
                  }}
                  className="flex min-h-[44px] w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <ShieldCheck className="h-4 w-4 text-[#14532D]" />
                  <span>Account &amp; Security</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="flex min-h-[44px] w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
