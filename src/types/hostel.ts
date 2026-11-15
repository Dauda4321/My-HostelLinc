export type CampusLocation = 'Tamale' | 'Nyankpala' | 'City' | 'Wa';

export type OccupancyType = '1-in-1' | '2-in-1' | '4-in-1';

export type RoomStatus = 'Available' | 'Full' | 'Under Maintenance';

export type PortalRole = 'student' | 'landlord' | 'caretaker';

export type UserRole = 'student' | 'landlord' | 'caretaker';

export type MaintenanceStatus = 'Pending' | 'In Progress' | 'Resolved';

export type MaintenanceCategory =
  | 'Plumbing'
  | 'Electrical'
  | 'Ceiling Fan'
  | 'Carpentry & Locks'
  | 'Water Supply'
  | 'Wi-Fi & Network'
  | 'Other';

export interface UserAccount {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  studentId?: string;
  createdAt: string;
}

export interface LandlordAccount {
  id: string;
  fullName: string;
  contact: string; // Email or Phone
  password: string;
  createdAt: string;
}

export type PhotoCategory = 'room' | 'utilities' | 'kitchen';

export interface HostelPhoto {
  id: string;
  category: PhotoCategory;
  url: string;
  caption: string;
  roomType?: OccupancyType;
}

export interface Hostel {
  id: string;
  ownerId: string;
  name: string;
  ownerName: string;
  campus: CampusLocation;
  contactPhone: string;
  description: string;
  rules: string[];
  imageUrl: string;
  photos: HostelPhoto[];
  createdAt: string;
}

export interface Room {
  id: string;
  hostelId: string;
  roomNumber: string; // e.g., "Block A - R101"
  occupancyType: OccupancyType;
  totalBeds: number;
  availableBeds: number;
  annualRentGhs: number;
  status: RoomStatus;
  utilityDetails: string;
  amenities: string[];
  photos?: HostelPhoto[];
}

export interface BookingRecord {
  id: string;
  referenceCode: string; // e.g., "UDS-2026-8492"
  hostelId: string;
  roomId: string;
  userId?: string;
  studentName: string;
  studentId: string;
  studentPhone: string;
  programmeLevel: string;
  annualRentGhs: number;
  acceptedTerms: boolean;
  createdAt: string;
  checkedIn: boolean;
  checkedInAt?: string;
}

export interface MaintenanceTicket {
  id: string;
  hostelId: string;
  roomNumber: string;
  category: MaintenanceCategory;
  description: string;
  reportedBy: string;
  studentId: string;
  status: MaintenanceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  users: UserAccount[];
  currentUserId: string | null;
  landlords: LandlordAccount[];
  activeLandlordId: string;
  hostels: Hostel[];
  rooms: Room[];
  bookings: BookingRecord[];
  tickets: MaintenanceTicket[];
}
