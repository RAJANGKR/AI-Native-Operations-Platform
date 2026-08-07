export interface DashboardKPIs {
  total_spending: number;
  total_budget: number;
  active_events: number;
  pending_approvals: number;
  total_members: number;
}

export interface MonthlySpendingItem {
  month: string;
  amount: number;
}

export interface CategorySpendingItem {
  category: string;
  amount: number;
  percentage: number;
}

export interface TopEventItem {
  id: string;
  name: string;
  chapter_name: string | null;
  start_date: string | null;
  total_spending: number;
  status: string;
}

export interface RecentReportItem {
  id: string;
  title: string;
  member_name: string | null;
  amount: number;
  status: string;
  submitted_at: string | null;
  created_at: string;
}

export interface RecentExpenseItem {
  id: string;
  merchant: string | null;
  category: string;
  amount: number;
  expense_date: string;
  status: string;
}

export interface DashboardResponse {
  kpis: DashboardKPIs;
  monthly_spending: MonthlySpendingItem[];
  spending_by_category: CategorySpendingItem[];
  top_events: TopEventItem[];
  recent_reports: RecentReportItem[];
  recent_expenses: RecentExpenseItem[];
}
