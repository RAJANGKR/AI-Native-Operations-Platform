export type StatusType =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "in-review"
  | "approved"
  | "rejected"
  | "draft";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface MetricData {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  description?: string;
  iconName?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  initials: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  status: number;
}

export * from "./dashboard";
export * from "./event";
export * from "./expense-report";
export * from "./expense";
export * from "./auth";
