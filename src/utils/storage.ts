import { AppState, UserAccount } from '../types/hostel';
import { createSeedPhotosForHostel, createSeedState, SEEDED_USERS } from '../data/seedData';

const STORAGE_KEY = 'uds_hostelhub_state_v1';

export function normalizePhone(value: string): string {
  return value.replace(/[\s\-()]/g, '').trim();
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function findUserByIdentifier(
  users: UserAccount[],
  identifier: string
): UserAccount | undefined {
  const cleanEmail = normalizeEmail(identifier);
  const cleanPhone = normalizePhone(identifier);
  if (!cleanEmail && !cleanPhone) return undefined;

  return users.find((u) => {
    const uEmail = normalizeEmail(u.email);
    const uPhone = normalizePhone(u.phone);
    return (cleanEmail && uEmail === cleanEmail) || (cleanPhone && uPhone === cleanPhone);
  });
}

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = createSeedState();
      saveAppState(seed);
      return seed;
    }
    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (
      !parsed ||
      !Array.isArray(parsed.hostels) ||
      !Array.isArray(parsed.rooms)
    ) {
      const seed = createSeedState();
      saveAppState(seed);
      return seed;
    }

    // Upgrade existing localStorage snapshot seamlessly if `users` is missing
    let users: UserAccount[] = Array.isArray(parsed.users) ? parsed.users : [];
    if (users.length === 0) {
      users = SEEDED_USERS.map((u) => ({ ...u }));
      if (Array.isArray(parsed.landlords)) {
        for (const l of parsed.landlords) {
          if (l.id !== 'owner-abdul-karim' && !users.some((u) => u.id === l.id)) {
            const isEmail = l.contact.includes('@');
            users.push({
              id: l.id,
              role: 'landlord',
              fullName: l.fullName,
              email: isEmail ? l.contact : '',
              phone: isEmail ? '' : l.contact,
              password: l.password || 'Password123',
              createdAt: l.createdAt,
            });
          }
        }
      }
    }

    const upgradedHostels = parsed.hostels.map((h) => ({
      ...h,
      photos:
        Array.isArray(h.photos) && h.photos.length > 0
          ? h.photos
          : createSeedPhotosForHostel(h.id),
    }));

    const upgraded: AppState = {
      users,
      currentUserId: parsed.currentUserId ?? null,
      landlords: Array.isArray(parsed.landlords) ? parsed.landlords : [],
      activeLandlordId: parsed.activeLandlordId ?? 'owner-abdul-karim',
      hostels: upgradedHostels,
      rooms: parsed.rooms,
      bookings: Array.isArray(parsed.bookings) ? parsed.bookings : [],
      tickets: Array.isArray(parsed.tickets) ? parsed.tickets : [],
    };
    saveAppState(upgraded);
    return upgraded;
  } catch {
    const seed = createSeedState();
    saveAppState(seed);
    return seed;
  }
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors safely
  }
}

export function resetAppState(): AppState {
  const seed = createSeedState();
  saveAppState(seed);
  return seed;
}

export function generateBookingCode(existingCodes: string[]): string {
  const existing = new Set(existingCodes);
  for (let i = 0; i < 50; i++) {
    const num = Math.floor(1000 + Math.random() * 9000);
    const code = `UDS-2026-${num}`;
    if (!existing.has(code)) {
      return code;
    }
  }
  return `UDS-2026-${Date.now().toString().slice(-4)}`;
}

export function formatGhs(amount: number): string {
  return `GHS ${amount.toLocaleString('en-GH')}`;
}

export function formatShortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}
