export interface ReportItem {
  id: string;
  title: string;
  event: string;
  chapter: string;
  owner: {
    name: string;
    avatarInitials: string;
    role: string;
    email: string;
  };
  status: "draft" | "pending" | "submitted" | "approved" | "rejected";
  totalAmount: string;
  expensesCount: number;
  createdDate: string;
  description: string;
}

export interface ReportExpenseLineItem {
  id: string;
  merchant: string;
  category: string;
  amount: string;
  numericAmount: number;
  date: string;
  receiptName: string;
  receiptStatus: "verified" | "pending" | "missing";
}

export interface ReportAttachmentItem {
  id: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  verificationStatus: "verified" | "pending" | "missing";
  downloadUrl?: string;
}

export interface ReportActivityItem {
  id: string;
  title: string;
  actor: string;
  date: string;
  type: "expense_added" | "receipt_uploaded" | "report_edited" | "report_submitted";
}

export interface ReportDetailData extends ReportItem {
  expenses: ReportExpenseLineItem[];
  attachments: ReportAttachmentItem[];
  subtotal: string;
  tax: string;
  grandTotal: string;
  receiptsUploadedCount: number;
  pendingReceiptsCount: number;
  activityTimeline: ReportActivityItem[];
}

export const MOCK_REPORTS: ReportItem[] = [
  {
    id: "REP-9042",
    title: "RTMASS Keynote Speaker Logistics",
    event: "RTMASS 2026",
    chapter: "AI Chapter",
    owner: { name: "Ananya Sharma", avatarInitials: "AS", role: "Event Lead", email: "ananya.s@college.edu" },
    status: "submitted",
    totalAmount: "₹14,500",
    expensesCount: 3,
    createdDate: "Aug 05, 2026",
    description: "Travel tickets, hotel reservation, and local conveyance for guest speakers.",
  },
  {
    id: "REP-9041",
    title: "Hackathon Catering & Refreshments",
    event: "Hackathon 2026",
    chapter: "Coding Club",
    owner: { name: "Vikram Mehta", avatarInitials: "VM", role: "Logistics Lead", email: "vikram.m@college.edu" },
    status: "approved",
    totalAmount: "₹22,000",
    expensesCount: 4,
    createdDate: "Aug 04, 2026",
    description: "Bulk lunch boxes, evening snacks, and energy drinks for 36-hour hackathon participants.",
  },
  {
    id: "REP-9040",
    title: "Workshop Lab Printing Supplies",
    event: "Workshop Series",
    chapter: "Robotics Society",
    owner: { name: "Priya Nair", avatarInitials: "PN", role: "Coordinator", email: "priya.n@college.edu" },
    status: "draft",
    totalAmount: "₹6,800",
    expensesCount: 2,
    createdDate: "Aug 03, 2026",
    description: "Lab manual booklets, circuit diagrams, and reference sheets printing.",
  },
  {
    id: "REP-9039",
    title: "Industrial Visit Bus Booking",
    event: "Industrial Visit",
    chapter: "Mechanical Guild",
    owner: { name: "Rohan Gupta", avatarInitials: "RG", role: "Travel Lead", email: "rohan.g@college.edu" },
    status: "approved",
    totalAmount: "₹12,000",
    expensesCount: 2,
    createdDate: "Aug 02, 2026",
    description: "52-seater luxury bus charter advance and toll taxes.",
  },
  {
    id: "REP-9038",
    title: "Unapproved Hardware Purchase",
    event: "Hackathon 2026",
    chapter: "Coding Club",
    owner: { name: "Karan Singh", avatarInitials: "KS", role: "Tech Lead", email: "karan.s@college.edu" },
    status: "rejected",
    totalAmount: "₹9,000",
    expensesCount: 1,
    createdDate: "Jul 31, 2026",
    description: "High-end GPU board rental without prior budget authorization.",
  },
  {
    id: "REP-9037",
    title: "Quantum Seminar Sound System Rental",
    event: "Quantum Tech Seminar",
    chapter: "Physics Forum",
    owner: { name: "Sneha Patel", avatarInitials: "SP", role: "Secretary", email: "sneha.p@college.edu" },
    status: "pending",
    totalAmount: "₹14,200",
    expensesCount: 3,
    createdDate: "Jun 10, 2026",
    description: "Auditorium acoustic speakers, wireless lapels, and projector rental.",
  },
];

export const MOCK_REPORT_DETAILS: Record<string, ReportDetailData> = {
  "REP-9042": {
    ...MOCK_REPORTS[0],
    subtotal: "₹13,000",
    tax: "₹1,500",
    grandTotal: "₹14,500",
    receiptsUploadedCount: 3,
    pendingReceiptsCount: 0,
    expenses: [
      {
        id: "EXP-101",
        merchant: "IRCTC Railways",
        category: "Travel",
        amount: "₹4,200",
        numericAmount: 4200,
        date: "Aug 05, 2026",
        receiptName: "irctc_ticket_booking.pdf",
        receiptStatus: "verified",
      },
      {
        id: "EXP-102",
        merchant: "Hotel Grand Palace",
        category: "Accommodation",
        amount: "₹8,800",
        numericAmount: 8800,
        date: "Aug 05, 2026",
        receiptName: "hotel_invoice_aug5.pdf",
        receiptStatus: "verified",
      },
      {
        id: "EXP-103",
        merchant: "Ola Cabs Fleet",
        category: "Local Conveyance",
        amount: "₹1,500",
        numericAmount: 1500,
        date: "Aug 05, 2026",
        receiptName: "cab_receipt_airport.pdf",
        receiptStatus: "verified",
      },
    ],
    attachments: [
      {
        id: "att-1",
        fileName: "irctc_ticket_booking.pdf",
        fileSize: "1.2 MB",
        uploadDate: "Aug 05, 2026",
        verificationStatus: "verified",
      },
      {
        id: "att-2",
        fileName: "hotel_invoice_aug5.pdf",
        fileSize: "2.4 MB",
        uploadDate: "Aug 05, 2026",
        verificationStatus: "verified",
      },
      {
        id: "att-3",
        fileName: "cab_receipt_airport.pdf",
        fileSize: "680 KB",
        uploadDate: "Aug 05, 2026",
        verificationStatus: "verified",
      },
    ],
    activityTimeline: [
      {
        id: "act-1",
        title: "Expense Added: IRCTC Railways (₹4,200)",
        actor: "Ananya Sharma",
        date: "Aug 05, 2026 — 10:15 AM",
        type: "expense_added",
      },
      {
        id: "act-2",
        title: "Receipt Uploaded: irctc_ticket_booking.pdf",
        actor: "Ananya Sharma",
        date: "Aug 05, 2026 — 10:18 AM",
        type: "receipt_uploaded",
      },
      {
        id: "act-3",
        title: "Report Edited: Hotel & Cabs line items attached",
        actor: "Ananya Sharma",
        date: "Aug 05, 2026 — 02:40 PM",
        type: "report_edited",
      },
      {
        id: "act-4",
        title: "Report Submitted for Treasurer Audit",
        actor: "Ananya Sharma",
        date: "Aug 05, 2026 — 05:20 PM",
        type: "report_submitted",
      },
    ],
  },
};

// Fallback helper for report details
export function getReportDetails(reportId: string): ReportDetailData {
  if (MOCK_REPORT_DETAILS[reportId]) {
    return MOCK_REPORT_DETAILS[reportId];
  }
  const base = MOCK_REPORTS.find((r) => r.id === reportId) || MOCK_REPORTS[0];
  return {
    ...base,
    subtotal: "₹12,000",
    tax: "₹1,200",
    grandTotal: base.totalAmount,
    receiptsUploadedCount: 2,
    pendingReceiptsCount: 1,
    expenses: MOCK_REPORT_DETAILS["REP-9042"].expenses,
    attachments: MOCK_REPORT_DETAILS["REP-9042"].attachments,
    activityTimeline: MOCK_REPORT_DETAILS["REP-9042"].activityTimeline,
  };
}
