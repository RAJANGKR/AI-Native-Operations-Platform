export interface EventItem {
  id: string;
  name: string;
  chapter: string;
  status: "running" | "upcoming" | "completed" | "archived";
  budget: number;
  formattedBudget: string;
  spent: number;
  formattedSpent: string;
  remaining: number;
  formattedRemaining: string;
  percentageUsed: number;
  reportsCount: number;
  expensesCount: number;
  startDate: string;
  endDate: string;
  description: string;
}

export interface EventTimelineItem {
  id: string;
  title: string;
  description: string;
  amount: string;
  date: string;
  category: string;
  status: "verified" | "pending" | "flagged";
}

export interface EventAttachmentStats {
  receiptsUploaded: number;
  verifiedCount: number;
  ocrPendingCount: number;
  missingReceiptsCount: number;
}

export interface EventDetailData extends EventItem {
  membersCount: number;
  reports: Array<{
    id: string;
    title: string;
    owner: { name: string; avatarInitials: string; role: string };
    status: "draft" | "in-review" | "approved" | "rejected";
    amount: string;
    submittedDate: string;
  }>;
  expenses: Array<{
    id: string;
    merchant: string;
    category: string;
    amount: string;
    date: string;
    receiptStatus: "verified" | "pending" | "missing";
  }>;
  timeline: EventTimelineItem[];
  attachments: EventAttachmentStats;
}

export const MOCK_EVENTS: EventItem[] = [
  {
    id: "rtmass-2026",
    name: "RTMASS 2026",
    chapter: "AI Chapter",
    status: "running",
    budget: 50000,
    formattedBudget: "₹50,000",
    spent: 42000,
    formattedSpent: "₹42,000",
    remaining: 8000,
    formattedRemaining: "₹8,000",
    percentageUsed: 84,
    reportsCount: 12,
    expensesCount: 84,
    startDate: "Aug 01, 2026",
    endDate: "Aug 15, 2026",
    description: "National Symposium on Recent Trends in Material & Applied Sciences.",
  },
  {
    id: "hackathon-2026",
    name: "Hackathon 2026",
    chapter: "Coding Club",
    status: "running",
    budget: 40000,
    formattedBudget: "₹40,000",
    spent: 31000,
    formattedSpent: "₹31,000",
    remaining: 9000,
    formattedRemaining: "₹9,000",
    percentageUsed: 77.5,
    reportsCount: 8,
    expensesCount: 46,
    startDate: "Jul 28, 2026",
    endDate: "Aug 10, 2026",
    description: "36-hour inter-college hackathon focusing on AI native workflows.",
  },
  {
    id: "workshop-series",
    name: "Workshop Series",
    chapter: "Robotics Society",
    status: "running",
    budget: 25000,
    formattedBudget: "₹25,000",
    spent: 18500,
    formattedSpent: "₹18,500",
    remaining: 6500,
    formattedRemaining: "₹6,500",
    percentageUsed: 74,
    reportsCount: 5,
    expensesCount: 28,
    startDate: "Aug 05, 2026",
    endDate: "Aug 20, 2026",
    description: "Hands-on robotics hardware and micro-controller assembly workshops.",
  },
  {
    id: "industrial-visit",
    name: "Industrial Visit",
    chapter: "Mechanical Guild",
    status: "completed",
    budget: 20000,
    formattedBudget: "₹20,000",
    spent: 12000,
    formattedSpent: "₹12,000",
    remaining: 8000,
    formattedRemaining: "₹8,000",
    percentageUsed: 60,
    reportsCount: 4,
    expensesCount: 15,
    startDate: "Jul 15, 2026",
    endDate: "Jul 18, 2026",
    description: "Educational trip to automotive manufacturing and assembly plants.",
  },
  {
    id: "cultural-fest",
    name: "Annual Cultural Fest",
    chapter: "Cultural Board",
    status: "upcoming",
    budget: 85000,
    formattedBudget: "₹85,000",
    spent: 12500,
    formattedSpent: "₹12,500",
    remaining: 72500,
    formattedRemaining: "₹72,500",
    percentageUsed: 14.7,
    reportsCount: 3,
    expensesCount: 9,
    startDate: "Sep 10, 2026",
    endDate: "Sep 15, 2026",
    description: "Inter-departmental music, dance, and fine arts competitive festival.",
  },
  {
    id: "tech-seminar",
    name: "Quantum Tech Seminar",
    chapter: "Physics Forum",
    status: "completed",
    budget: 15000,
    formattedBudget: "₹15,000",
    spent: 14200,
    formattedSpent: "₹14,200",
    remaining: 800,
    formattedRemaining: "₹800",
    percentageUsed: 94.6,
    reportsCount: 3,
    expensesCount: 18,
    startDate: "Jun 10, 2026",
    endDate: "Jun 11, 2026",
    description: "Guest lecture series on quantum computing primitives.",
  },
];

export const MOCK_EVENT_DETAILS: Record<string, EventDetailData> = {
  "rtmass-2026": {
    ...MOCK_EVENTS[0],
    membersCount: 14,
    reports: [
      {
        id: "REP-9042",
        title: "Keynote Speaker Hotel & Logistics",
        owner: { name: "Ananya Sharma", avatarInitials: "AS", role: "Logistics Lead" },
        status: "in-review",
        amount: "₹14,500",
        submittedDate: "Aug 05, 2026",
      },
      {
        id: "REP-9041",
        title: "Stage Lighting & Audio System Rental",
        owner: { name: "Vikram Mehta", avatarInitials: "VM", role: "Event Lead" },
        status: "approved",
        amount: "₹18,000",
        submittedDate: "Aug 03, 2026",
      },
      {
        id: "REP-9040",
        title: "Delegate Kits & Lanyards Printing",
        owner: { name: "Priya Nair", avatarInitials: "PN", role: "Design Head" },
        status: "approved",
        amount: "₹6,500",
        submittedDate: "Aug 02, 2026",
      },
      {
        id: "REP-9039",
        title: "VIP Lunch & High Tea Catering",
        owner: { name: "Rohan Gupta", avatarInitials: "RG", role: "Hospitality Lead" },
        status: "draft",
        amount: "₹3,000",
        submittedDate: "Aug 01, 2026",
      },
    ],
    expenses: [
      {
        id: "EXP-801",
        merchant: "IRCTC Railways",
        category: "Travel",
        amount: "₹4,200",
        date: "Aug 05, 2026",
        receiptStatus: "verified",
      },
      {
        id: "EXP-802",
        merchant: "Hotel Grand Palace",
        category: "Accommodation",
        amount: "₹10,300",
        date: "Aug 05, 2026",
        receiptStatus: "verified",
      },
      {
        id: "EXP-803",
        merchant: "SoundCraft Rentals",
        category: "Equipment",
        amount: "₹18,000",
        date: "Aug 03, 2026",
        receiptStatus: "pending",
      },
      {
        id: "EXP-804",
        merchant: "PrintExpress Stationers",
        category: "Printing",
        amount: "₹6,500",
        date: "Aug 02, 2026",
        receiptStatus: "verified",
      },
      {
        id: "EXP-805",
        merchant: "Chai Point Catering",
        category: "Food",
        amount: "₹3,000",
        date: "Aug 01, 2026",
        receiptStatus: "missing",
      },
    ],
    timeline: [
      {
        id: "tl-1",
        title: "Poster & Flex Banner Printing",
        description: "Promotional flex banners printed and installed at main gate.",
        amount: "₹6,500",
        date: "Aug 02, 2026",
        category: "Printing",
        status: "verified",
      },
      {
        id: "tl-2",
        title: "Catering Advance Payment",
        description: "Advance deposit paid for keynote lunch catering.",
        amount: "₹3,000",
        date: "Aug 03, 2026",
        category: "Food",
        status: "pending",
      },
      {
        id: "tl-3",
        title: "Transport Booking Deposit",
        description: "Travel tickets booked for keynote speaker arrival.",
        amount: "₹4,200",
        date: "Aug 04, 2026",
        category: "Travel",
        status: "verified",
      },
      {
        id: "tl-4",
        title: "Stage Decoration & AV Rental",
        description: "Full audio visual setup completed in main auditorium.",
        amount: "₹18,000",
        date: "Aug 04, 2026",
        category: "Equipment",
        status: "verified",
      },
      {
        id: "tl-5",
        title: "Volunteer Meals & Refreshments",
        description: "Snack packs distributed to 25 student volunteers.",
        amount: "₹10,300",
        date: "Aug 05, 2026",
        category: "Food",
        status: "verified",
      },
    ],
    attachments: {
      receiptsUploaded: 12,
      verifiedCount: 10,
      ocrPendingCount: 1,
      missingReceiptsCount: 1,
    },
  },
};

// Fallback helper for missing details
export function getEventDetails(eventId: string): EventDetailData {
  if (MOCK_EVENT_DETAILS[eventId]) {
    return MOCK_EVENT_DETAILS[eventId];
  }
  const base = MOCK_EVENTS.find((e) => e.id === eventId) || MOCK_EVENTS[0];
  return {
    ...base,
    membersCount: 8,
    reports: MOCK_EVENT_DETAILS["rtmass-2026"].reports,
    expenses: MOCK_EVENT_DETAILS["rtmass-2026"].expenses,
    timeline: MOCK_EVENT_DETAILS["rtmass-2026"].timeline,
    attachments: MOCK_EVENT_DETAILS["rtmass-2026"].attachments,
  };
}
