import {
  AppState,
  Hostel,
  LandlordAccount,
  OccupancyType,
  Room,
  BookingRecord,
  MaintenanceTicket,
  UserAccount,
} from '../types/hostel';

import executiveImg from '../assets/images/hostel_executive_tamale_1794743263277.jpg';
import annexImg from '../assets/images/hostel_annex_tamale_1794743263526.jpg';
import royalImg from '../assets/images/hostel_royal_tamale_1794743264325.jpg';
import roomInteriorImg from '../assets/images/hostel_room_interior_1794743265084.jpg';
import roomSingleImg from '../assets/images/room_single_suite_1794745586872.jpg';
import roomQuadImg from '../assets/images/room_quad_shared_1794745587322.jpg';
import washroomImg from '../assets/images/utility_washroom_1794745587914.jpg';
import boreholeMetersImg from '../assets/images/utility_borehole_meters_1794745587789.jpg';
import kitchenImg from '../assets/images/hostel_kitchen_1794745588438.jpg';

export const HOSTEL_IMAGES = {
  executive: executiveImg,
  annex: annexImg,
  royal: royalImg,
  roomInterior: roomInteriorImg,
  roomSingle: roomSingleImg,
  roomQuad: roomQuadImg,
  washroom: washroomImg,
  boreholeMeters: boreholeMetersImg,
  kitchen: kitchenImg,
};

export function createSeedPhotosForHostel(hostelId: string): Hostel['photos'] {
  if (hostelId === 'hostel-ak-executive') {
    return [
      {
        id: `${hostelId}-p-u3`,
        category: 'utilities',
        url: HOSTEL_IMAGES.executive,
        caption: 'Abdul-Karim Executive Hostel Exterior — Paved gated courtyard & 24-hour security compound',
      },
      {
        id: `${hostelId}-p-r1`,
        category: 'room',
        roomType: '1-in-1',
        url: HOSTEL_IMAGES.roomSingle,
        caption: '1-in-1 Private Executive Room — Single bed, study desk, wardrobe & ceiling fan',
      },
      {
        id: `${hostelId}-p-r2`,
        category: 'room',
        roomType: '2-in-1',
        url: HOSTEL_IMAGES.roomInterior,
        caption: '2-in-1 Twin Study Room — Two wooden beds, shared study table & sunlit window',
      },
      {
        id: `${hostelId}-p-r3`,
        category: 'room',
        roomType: '4-in-1',
        url: HOSTEL_IMAGES.roomQuad,
        caption: '4-in-1 Shared Quad Room — Bunk beds, individual lockers & twin ceiling fans',
      },
      {
        id: `${hostelId}-p-u1`,
        category: 'utilities',
        url: HOSTEL_IMAGES.washroom,
        caption: 'Tiled En-Suite & Shared Washrooms — Walk-in shower, vanity sink & ventilation',
      },
      {
        id: `${hostelId}-p-u2`,
        category: 'utilities',
        url: HOSTEL_IMAGES.boreholeMeters,
        caption: 'Mechanized Borehole, Polytank Overhead Storage & Prepaid ECG Meter Bank',
      },
      {
        id: `${hostelId}-p-k1`,
        category: 'kitchen',
        url: HOSTEL_IMAGES.kitchen,
        caption: 'Shared Student Kitchen — Ground Floor Block A with double sink & cooking bay',
      },
    ];
  }

  if (hostelId === 'hostel-ak-annex') {
    return [
      {
        id: `${hostelId}-p-u3`,
        category: 'utilities',
        url: HOSTEL_IMAGES.annex,
        caption: 'Abdul-Karim Annex Hostel Exterior — Perimeter security fence & landscaped compound',
      },
      {
        id: `${hostelId}-p-r1`,
        category: 'room',
        roomType: '1-in-1',
        url: HOSTEL_IMAGES.roomSingle,
        caption: '1-in-1 Quiet Study Room — Built-in wardrobe, desk & louvered ventilation',
      },
      {
        id: `${hostelId}-p-r2`,
        category: 'room',
        roomType: '2-in-1',
        url: HOSTEL_IMAGES.roomInterior,
        caption: '2-in-1 Shared Room — Tiled floor, twin wooden beds & study workspace',
      },
      {
        id: `${hostelId}-p-r3`,
        category: 'room',
        roomType: '4-in-1',
        url: HOSTEL_IMAGES.roomQuad,
        caption: '4-in-1 Spacious Student Room — Four personal lockers & dual ceiling fans',
      },
      {
        id: `${hostelId}-p-u1`,
        category: 'utilities',
        url: HOSTEL_IMAGES.washroom,
        caption: 'Clean Tiled Student Washroom — Ceramic sink, mirror & shower enclosure',
      },
      {
        id: `${hostelId}-p-u2`,
        category: 'utilities',
        url: HOSTEL_IMAGES.boreholeMeters,
        caption: 'Overhead Polytank Reserve, Borehole Pump & Per-Room Prepaid ECG Meters',
      },
      {
        id: `${hostelId}-p-k1`,
        category: 'kitchen',
        url: HOSTEL_IMAGES.kitchen,
        caption: 'Annex Student Kitchenette — Tiled countertop, storage shelves & stove bay',
      },
    ];
  }

  // Royal Hostel or default new hostel fallback
  return [
    {
      id: `${hostelId}-p-u3`,
      category: 'utilities',
      url: HOSTEL_IMAGES.royal,
      caption: 'Gated Hostel Compound — Courtyard access, standby generator & water reserve',
    },
    {
      id: `${hostelId}-p-r2`,
      category: 'room',
      roomType: '2-in-1',
      url: HOSTEL_IMAGES.roomInterior,
      caption: '2-in-1 Twin Room — Bright window light, study desk & tiled flooring',
    },
    {
      id: `${hostelId}-p-r3`,
      category: 'room',
      roomType: '4-in-1',
      url: HOSTEL_IMAGES.roomQuad,
      caption: '4-in-1 Standard Shared Room — Sturdy bunk beds, study desks & lockers',
    },
    {
      id: `${hostelId}-p-u1`,
      category: 'utilities',
      url: HOSTEL_IMAGES.washroom,
      caption: 'Hostel Washroom Facilities — Clean ceramic tiling & constant borehole flow',
    },
    {
      id: `${hostelId}-p-u2`,
      category: 'utilities',
      url: HOSTEL_IMAGES.boreholeMeters,
      caption: 'High-Capacity Polytank Water Towers & Prepaid ECG Electricity Meters',
    },
    {
      id: `${hostelId}-p-k1`,
      category: 'kitchen',
      url: HOSTEL_IMAGES.kitchen,
      caption: 'Shared Courtyard Student Kitchen — Double stainless sink & cooking counter',
    },
  ];
}

export const CAMPUSES = ['Tamale', 'Nyankpala', 'City', 'Wa'] as const;

export const DEFAULT_AMENITIES = [
  'Wi-Fi',
  'Security Fence',
  'Study Desk',
  'Backup Generator',
  'Ceiling Fan',
  'Wardrobe',
  'Tiled Floor',
  '24/7 Caretaker',
];

export const SEEDED_USERS: UserAccount[] = [
  {
    id: 'owner-abdul-karim',
    role: 'landlord',
    fullName: 'Mr. Abdul-Karim',
    email: 'abdulkarim@udshostels.com',
    phone: '0244000001',
    password: 'Password123',
    createdAt: '2026-08-15T09:00:00.000Z',
  },
  {
    id: 'caretaker-manager',
    role: 'caretaker',
    fullName: 'Alhassan Sulemana (Hostel Manager)',
    email: 'manager@udshostels.com',
    phone: '0244000002',
    password: 'Password123',
    createdAt: '2026-08-15T09:00:00.000Z',
  },
  {
    id: 'student-demo',
    role: 'student',
    fullName: 'Kofi Mensah',
    studentId: 'UDS/NUR/0145/24',
    email: 'student@uds.edu.gh',
    phone: '0544000003',
    password: 'Password123',
    createdAt: '2026-08-15T09:00:00.000Z',
  },
];

function getBedsForType(type: OccupancyType): number {
  if (type === '1-in-1') return 1;
  if (type === '2-in-1') return 2;
  return 4;
}

interface HostelRoomPlan {
  hostelId: string;
  distribution: Array<{
    occupancyType: OccupancyType;
    count: number;
    rentGhs: number;
    utilities: string;
    amenities: string[];
  }>;
}

function generate40RoomsForHostel(plan: HostelRoomPlan): Room[] {
  const rooms: Room[] = [];
  const blocks = ['Block A', 'Block B'];
  const floors = [100, 200]; // R101-R110, R201-R210 per block => 40 rooms total

  const expandedConfigs: Array<{
    occupancyType: OccupancyType;
    rentGhs: number;
    utilities: string;
    amenities: string[];
  }> = [];

  for (const tier of plan.distribution) {
    for (let i = 0; i < tier.count; i++) {
      expandedConfigs.push({
        occupancyType: tier.occupancyType,
        rentGhs: tier.rentGhs,
        utilities: tier.utilities,
        amenities: tier.amenities,
      });
    }
  }

  let idx = 0;
  for (const block of blocks) {
    for (const floorBase of floors) {
      for (let num = 1; num <= 10; num++) {
        const cfg = expandedConfigs[idx];
        const totalBeds = getBedsForType(cfg.occupancyType);
        const roomCode = `R${floorBase + num}`;
        const roomNumber = `${block} - ${roomCode}`;

        let availableBeds = totalBeds;
        let status: Room['status'] = 'Available';

        if (idx === 3 || idx === 17) {
          availableBeds = 0;
          status = 'Full';
        } else if (idx === 29) {
          availableBeds = 0;
          status = 'Under Maintenance';
        } else if (totalBeds === 4 && idx % 5 === 0) {
          availableBeds = 2;
        } else if (totalBeds === 4 && idx % 7 === 0) {
          availableBeds = 1;
        } else if (totalBeds === 2 && idx % 6 === 0) {
          availableBeds = 1;
        }

        rooms.push({
          id: `${plan.hostelId}-room-${idx + 1}`,
          hostelId: plan.hostelId,
          roomNumber,
          occupancyType: cfg.occupancyType,
          totalBeds,
          availableBeds,
          annualRentGhs: cfg.rentGhs,
          status,
          utilityDetails: cfg.utilities,
          amenities: cfg.amenities,
        });

        idx++;
      }
    }
  }

  return rooms;
}

export function createSeedState(): AppState {
  const abdulKarimAccount: LandlordAccount = {
    id: 'owner-abdul-karim',
    fullName: 'Mr. Abdul-Karim',
    contact: '0244000001',
    password: 'Password123',
    createdAt: '2026-08-15T09:00:00.000Z',
  };

  const hostels: Hostel[] = [
    {
      id: 'hostel-ak-executive',
      ownerId: abdulKarimAccount.id,
      name: 'Abdul-Karim Executive Hostel',
      ownerName: 'Mr. Abdul-Karim',
      campus: 'Tamale',
      contactPhone: '0244000001',
      description:
        'Flagship three-story private student residence situated 6 minutes from the UDS Tamale Teaching Hospital & Campus gate, featuring individual study desks, reliable borehole supply, and gated 24-hour security.',
      rules: [
        'Full annual rent covers two academic semesters (August to June); no mid-year subletting permitted.',
        'Prepaid ECG meter credits are shared equally among room occupants; tamper-free meter policy applies.',
        'Quiet study hours are observed daily from 10:00 PM to 5:30 AM across all residential blocks.',
        'Visitors must sign in at the caretaker desk and vacate the compound by 9:30 PM.',
        'Cooking with open gas cylinders inside bedrooms is prohibited; designated kitchenette balconies must be used.',
      ],
      imageUrl: HOSTEL_IMAGES.executive,
      photos: createSeedPhotosForHostel('hostel-ak-executive'),
      createdAt: '2026-08-15T09:05:00.000Z',
    },
    {
      id: 'hostel-ak-annex',
      ownerId: abdulKarimAccount.id,
      name: 'Abdul-Karim Annex Hostel',
      ownerName: 'Mr. Abdul-Karim',
      campus: 'Tamale',
      contactPhone: '0244000001',
      description:
        'Quiet two-story sandstone residence designed for UDS medical, nursing, and health science students at Tamale Campus, featuring shaded study corridors and high-speed campus Wi-Fi.',
      rules: [
        'Tenancy runs for one full academic year; students must present a valid UDS Student ID at check-in.',
        'Prepaid ECG electricity is metered per room; water from the mechanized borehole is included in rent.',
        'All common corridors and shared bathrooms are cleaned thrice weekly; occupants maintain inner room hygiene.',
        'No pets, loud sound systems, or unauthorized electrical appliances (e.g., immersion heaters) allowed.',
        'Damage to beds, desks, or plumbing fixtures due to negligence will be billed to the occupant.',
      ],
      imageUrl: HOSTEL_IMAGES.annex,
      photos: createSeedPhotosForHostel('hostel-ak-annex'),
      createdAt: '2026-08-15T09:10:00.000Z',
    },
    {
      id: 'hostel-ak-royal',
      ownerId: abdulKarimAccount.id,
      name: 'Abdul-Karim Royal Hostel',
      ownerName: 'Mr. Abdul-Karim',
      campus: 'Tamale',
      contactPhone: '0244000001',
      description:
        'Spacious courtyard hostel complex offering affordable 2-in-1 and 4-in-1 shared accommodation near UDS Tamale Campus, complete with backup standby generator and large water storage reserve.',
      rules: [
        'Reservation confirms bed allocation for the academic session; check-in must be completed within 14 days of reopening.',
        'Standby generator operates automatically during ECG outages between 6:30 PM and 11:30 PM.',
        'Security gate locks at 11:00 PM daily; late clinical-duty students must notify the resident caretaker in advance.',
        'Roommates share responsibility for room keys and keeping shared study areas tidy.',
        'Maintenance issues must be logged immediately through the HostelHub portal for caretaker dispatch.',
      ],
      imageUrl: HOSTEL_IMAGES.royal,
      photos: createSeedPhotosForHostel('hostel-ak-royal'),
      createdAt: '2026-08-15T09:15:00.000Z',
    },
  ];

  const executiveRooms = generate40RoomsForHostel({
    hostelId: 'hostel-ak-executive',
    distribution: [
      {
        occupancyType: '1-in-1',
        count: 10,
        rentGhs: 4600,
        utilities: 'Individual Prepaid ECG meter · Mechanized borehole + GWCL water · Weekly waste pickup',
        amenities: ['Wi-Fi', 'Security Fence', 'Study Desk', 'Backup Generator', 'Ceiling Fan', 'En-suite Bath'],
      },
      {
        occupancyType: '2-in-1',
        count: 15,
        rentGhs: 3100,
        utilities: 'Shared room Prepaid ECG meter · Borehole water included · Weekly waste pickup',
        amenities: ['Wi-Fi', 'Security Fence', 'Study Desk', 'Backup Generator', 'Ceiling Fan', 'Wardrobe'],
      },
      {
        occupancyType: '4-in-1',
        count: 15,
        rentGhs: 1900,
        utilities: 'Shared room Prepaid ECG meter · Borehole water included · Common lighting covered',
        amenities: ['Wi-Fi', 'Security Fence', 'Study Desk', 'Backup Generator', 'Ceiling Fan'],
      },
    ],
  });

  const annexRooms = generate40RoomsForHostel({
    hostelId: 'hostel-ak-annex',
    distribution: [
      {
        occupancyType: '1-in-1',
        count: 8,
        rentGhs: 4200,
        utilities: 'Individual Prepaid ECG meter · Borehole + overhead storage tank · Waste disposal included',
        amenities: ['Wi-Fi', 'Security Fence', 'Study Desk', 'Backup Generator', 'Ceiling Fan', 'Wardrobe'],
      },
      {
        occupancyType: '2-in-1',
        count: 16,
        rentGhs: 2800,
        utilities: 'Shared room Prepaid ECG meter · Borehole water supply included',
        amenities: ['Wi-Fi', 'Security Fence', 'Study Desk', 'Backup Generator', 'Ceiling Fan'],
      },
      {
        occupancyType: '4-in-1',
        count: 16,
        rentGhs: 1750,
        utilities: 'Shared room Prepaid ECG meter · Borehole water supply included',
        amenities: ['Wi-Fi', 'Security Fence', 'Study Desk', 'Backup Generator', 'Tiled Floor'],
      },
    ],
  });

  const royalRooms = generate40RoomsForHostel({
    hostelId: 'hostel-ak-royal',
    distribution: [
      {
        occupancyType: '2-in-1',
        count: 16,
        rentGhs: 2600,
        utilities: 'Shared Prepaid ECG meter · High-capacity borehole tanks · Generator backup included',
        amenities: ['Wi-Fi', 'Security Fence', 'Study Desk', 'Backup Generator', 'Ceiling Fan'],
      },
      {
        occupancyType: '4-in-1',
        count: 24,
        rentGhs: 1550,
        utilities: 'Shared Prepaid ECG meter · Borehole water supply · Generator evening backup',
        amenities: ['Wi-Fi', 'Security Fence', 'Study Desk', 'Backup Generator'],
      },
    ],
  });

  const allRooms = [...executiveRooms, ...annexRooms, ...royalRooms];

  const sampleBookings: BookingRecord[] = [
    {
      id: 'booking-seed-1',
      referenceCode: 'UDS-2026-4108',
      hostelId: 'hostel-ak-executive',
      roomId: 'hostel-ak-executive-room-1',
      studentName: 'Amina Mohammed Sualihu',
      studentId: 'UDS/MD/0284/24',
      studentPhone: '024 812 3301',
      programmeLevel: 'MBChB Medicine · Level 300',
      annualRentGhs: 4600,
      acceptedTerms: true,
      createdAt: '2026-11-10T11:20:00.000Z',
      checkedIn: false,
    },
    {
      id: 'booking-seed-2',
      referenceCode: 'UDS-2026-6729',
      hostelId: 'hostel-ak-executive',
      roomId: 'hostel-ak-executive-room-13',
      studentName: 'Kwame Boateng Mensah',
      studentId: 'UDS/NUR/0119/25',
      studentPhone: '055 390 1422',
      programmeLevel: 'BSc Nursing · Level 200',
      annualRentGhs: 3100,
      acceptedTerms: true,
      createdAt: '2026-11-11T15:45:00.000Z',
      checkedIn: true,
      checkedInAt: '2026-11-12T09:15:00.000Z',
    },
    {
      id: 'booking-seed-3',
      referenceCode: 'UDS-2026-8492',
      hostelId: 'hostel-ak-annex',
      roomId: 'hostel-ak-annex-room-13',
      studentName: 'Fatima Alhassan Yakubu',
      studentId: 'UDS/MLS/0064/23',
      studentPhone: '020 744 8891',
      programmeLevel: 'BSc Medical Lab Science · Level 400',
      annualRentGhs: 2800,
      acceptedTerms: true,
      createdAt: '2026-11-12T10:10:00.000Z',
      checkedIn: false,
    },
    {
      id: 'booking-seed-4',
      referenceCode: 'UDS-2026-9315',
      hostelId: 'hostel-ak-royal',
      roomId: 'hostel-ak-royal-room-21',
      studentName: 'Issahaku Fuseini',
      studentId: 'UDS/PHM/0198/25',
      studentPhone: '054 218 7734',
      programmeLevel: 'Doctor of Pharmacy · Level 200',
      annualRentGhs: 1550,
      acceptedTerms: true,
      createdAt: '2026-11-13T14:05:00.000Z',
      checkedIn: false,
    },
  ];

  for (const booking of sampleBookings) {
    const targetRoom = allRooms.find((r) => r.id === booking.roomId);
    if (targetRoom && targetRoom.availableBeds > 0) {
      targetRoom.availableBeds = Math.max(0, targetRoom.availableBeds - 1);
      if (targetRoom.availableBeds === 0 && targetRoom.status === 'Available') {
        targetRoom.status = 'Full';
      }
    }
  }

  const sampleTickets: MaintenanceTicket[] = [
    {
      id: 'ticket-seed-1',
      hostelId: 'hostel-ak-executive',
      roomNumber: 'Block B - R210',
      category: 'Electrical',
      description: 'Prepaid meter wall socket near study desk needs replacement.',
      reportedBy: 'Rashidatu Ibrahim',
      studentId: 'UDS/MD/0311/24',
      status: 'In Progress',
      createdAt: '2026-11-13T08:30:00.000Z',
      updatedAt: '2026-11-14T10:00:00.000Z',
    },
    {
      id: 'ticket-seed-2',
      hostelId: 'hostel-ak-annex',
      roomNumber: 'Block A - R104',
      category: 'Ceiling Fan',
      description: 'Ceiling fan regulator stuck on speed 1; emits faint humming noise.',
      reportedBy: 'Fatima Alhassan Yakubu',
      studentId: 'UDS/MLS/0064/23',
      status: 'Pending',
      createdAt: '2026-11-14T16:15:00.000Z',
      updatedAt: '2026-11-14T16:15:00.000Z',
    },
    {
      id: 'ticket-seed-3',
      hostelId: 'hostel-ak-royal',
      roomNumber: 'Block B - R102',
      category: 'Plumbing',
      description: 'Washroom tap washer worn out; slight drip when turned off.',
      reportedBy: 'Issahaku Fuseini',
      studentId: 'UDS/PHM/0198/25',
      status: 'Resolved',
      createdAt: '2026-11-11T09:40:00.000Z',
      updatedAt: '2026-11-12T13:20:00.000Z',
    },
  ];

  return {
    users: SEEDED_USERS.map((u) => ({ ...u })),
    currentUserId: null,
    landlords: [abdulKarimAccount],
    activeLandlordId: abdulKarimAccount.id,
    hostels,
    rooms: allRooms,
    bookings: sampleBookings,
    tickets: sampleTickets,
  };
}
