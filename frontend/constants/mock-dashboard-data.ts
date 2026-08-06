export interface KPIItem {
  id: string;
  title: string;
  value: string;
  subtext: string;
  change: string;
  trend: "up" | "down" | "neutral";
  iconName: "Wallet" | "PieChart" | "FileClock" | "Calendar";
}

export interface MonthlySpendItem {
  month: string;
  spent: number;
  budget: number;
}

export interface CategorySpendItem {
  name: string;
  amount: number;
  formattedAmount: string;
  percentage: number;
  color: string;
}

export interface SpendingEventItem {
  id: string;
  name: string;
  category: string;
  amount: number;
  formattedAmount: string;
  budgetCap: number;
  formattedCap: string;
  percentageUsed: number;
}

export interface ExpenseReportItem {
  id: string;
  title: string;
  member: {
    name: string;
    avatarInitials: string;
    role: string;
  };
  event: string;
  status: "draft" | "in-review" | "approved" | "rejected";
  amount: string;
  date: string;
}

export interface ExpenseLogItem {
  id: string;
  merchant: string;
  category: string;
  reportTitle: string;
  amount: string;
  date: string;
}

export const DASHBOARD_USER = {
  name: "Rajan",
  role: "Treasurer",
  organization: "Department of Engineering & Operations",
  todayDate: "Thursday, August 6, 2026",
};

export const KPI_DATA: KPIItem[] = [
  {
    id: "total-budget",
    title: "Total Budget",
    value: "₹250,000",
    subtext: "Q3 Total Allocated",
    change: "+6%",
    trend: "up",
    iconName: "Wallet",
  },
  {
    id: "total-spent",
    title: "Total Spent",
    value: "₹118,450",
    subtext: "48% of total budget utilized",
    change: "48%",
    trend: "neutral",
    iconName: "PieChart",
  },
  {
    id: "pending-reports",
    title: "Pending Reports",
    value: "8",
    subtext: "Awaiting Treasurer Audit",
    change: "Needs Review",
    trend: "down",
    iconName: "FileClock",
  },
  {
    id: "active-events",
    title: "Active Events",
    value: "6",
    subtext: "Currently running initiatives",
    change: "Running",
    trend: "up",
    iconName: "Calendar",
  },
];

export const MONTHLY_SPEND_DATA: MonthlySpendItem[] = [
  { month: "Feb", spent: 14200, budget: 35000 },
  { month: "Mar", spent: 22800, budget: 35000 },
  { month: "Apr", spent: 18500, budget: 35000 },
  { month: "May", spent: 29400, budget: 35000 },
  { month: "Jun", spent: 21500, budget: 35000 },
  { month: "Jul", spent: 38200, budget: 40000 },
  { month: "Aug", spent: 118450, budget: 250000 },
];

export const CATEGORY_SPEND_DATA: CategorySpendItem[] = [
  { name: "Travel", amount: 45000, formattedAmount: "₹45,000", percentage: 38, color: "#0f172a" },
  { name: "Food", amount: 28450, formattedAmount: "₹28,450", percentage: 24, color: "#334155" },
  { name: "Printing", amount: 18000, formattedAmount: "₹18,000", percentage: 15, color: "#64748b" },
  { name: "Equipment", amount: 17000, formattedAmount: "₹17,000", percentage: 14, color: "#94a3b8" },
  { name: "Misc", amount: 10000, formattedAmount: "₹10,000", percentage: 9, color: "#cbd5e1" },
];

export const TOP_EVENTS_DATA: SpendingEventItem[] = [
  {
    id: "event-1",
    name: "RTMASS",
    category: "National Symposium",
    amount: 42000,
    formattedAmount: "₹42,000",
    budgetCap: 50000,
    formattedCap: "₹50,000",
    percentageUsed: 84,
  },
  {
    id: "event-2",
    name: "Hackathon",
    category: "Technical Competition",
    amount: 31000,
    formattedAmount: "₹31,000",
    budgetCap: 40000,
    formattedCap: "₹40,000",
    percentageUsed: 77.5,
  },
  {
    id: "event-3",
    name: "Workshop",
    category: "Skill Development",
    amount: 18500,
    formattedAmount: "₹18,500",
    budgetCap: 25000,
    formattedCap: "₹25,000",
    percentageUsed: 74,
  },
  {
    id: "event-4",
    name: "Industrial Visit",
    category: "Outreach & Travel",
    amount: 12000,
    formattedAmount: "₹12,000",
    budgetCap: 20000,
    formattedCap: "₹20,000",
    percentageUsed: 60,
  },
];

export const RECENT_REPORTS_DATA: ExpenseReportItem[] = [
  {
    id: "REP-9042",
    title: "RTMASS Keynote Speaker Logistics",
    member: { name: "Ananya Sharma", avatarInitials: "AS", role: "Event Lead" },
    event: "RTMASS",
    status: "in-review",
    amount: "₹14,500",
    date: "Aug 05, 2026",
  },
  {
    id: "REP-9041",
    title: "Hackathon Catering & Refreshments",
    member: { name: "Vikram Mehta", avatarInitials: "VM", role: "Logistics Lead" },
    event: "Hackathon",
    status: "approved",
    amount: "₹22,000",
    date: "Aug 04, 2026",
  },
  {
    id: "REP-9040",
    title: "Workshop Lab Printing Supplies",
    member: { name: "Priya Nair", avatarInitials: "PN", role: "Coordinator" },
    event: "Workshop",
    status: "draft",
    amount: "₹6,800",
    date: "Aug 03, 2026",
  },
  {
    id: "REP-9039",
    title: "Industrial Visit Bus Booking",
    member: { name: "Rohan Gupta", avatarInitials: "RG", role: "Travel Lead" },
    event: "Industrial Visit",
    status: "approved",
    amount: "₹12,000",
    date: "Aug 02, 2026",
  },
  {
    id: "REP-9038",
    title: "Unapproved Hardware Purchase",
    member: { name: "Karan Singh", avatarInitials: "KS", role: "Tech Lead" },
    event: "Hackathon",
    status: "rejected",
    amount: "₹9,000",
    date: "Jul 31, 2026",
  },
];

export const RECENT_EXPENSES_DATA: ExpenseLogItem[] = [
  {
    id: "EXP-1001",
    merchant: "IRCTC Railways",
    category: "Travel",
    reportTitle: "RTMASS Keynote Speaker Logistics",
    amount: "₹4,200",
    date: "Aug 05, 2026",
  },
  {
    id: "EXP-1002",
    merchant: "Hotel Grand Palace",
    category: "Travel",
    reportTitle: "RTMASS Keynote Speaker Logistics",
    amount: "₹10,300",
    date: "Aug 05, 2026",
  },
  {
    id: "EXP-1003",
    merchant: "Domino's Pizza Bulk Order",
    category: "Food",
    reportTitle: "Hackathon Catering & Refreshments",
    amount: "₹18,500",
    date: "Aug 04, 2026",
  },
  {
    id: "EXP-1004",
    merchant: "PrintExpress Stationers",
    category: "Printing",
    reportTitle: "Workshop Lab Printing Supplies",
    amount: "₹6,800",
    date: "Aug 03, 2026",
  },
  {
    id: "EXP-1005",
    merchant: "VRL Travels Bus Charter",
    category: "Travel",
    reportTitle: "Industrial Visit Bus Booking",
    amount: "₹12,000",
    date: "Aug 02, 2026",
  },
  {
    id: "EXP-1006",
    merchant: "Chai Point Snacks",
    category: "Food",
    reportTitle: "Hackathon Catering & Refreshments",
    amount: "₹3,500",
    date: "Aug 01, 2026",
  },
];
