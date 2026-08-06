/**
 * Design Tokens for the AI-Native Expense Management Platform.
 * Enforces unified spacing, radii, color roles, typography scales, and shadows.
 */

export const SPACING = {
  xs: "0.25rem", // 4px
  sm: "0.5rem",  // 8px
  md: "1rem",    // 16px
  lg: "1.5rem",  // 24px
  xl: "2rem",    // 32px
  "2xl": "3rem", // 48px
} as const;

export const RADIUS = {
  none: "0px",
  sm: "0.375rem",  // 6px
  md: "0.5rem",    // 8px
  lg: "0.75rem",   // 12px
  xl: "1rem",      // 16px
  full: "9999px",
} as const;

export const COLOR_TOKENS = {
  background: "#f8fafc",
  surface: "#ffffff",
  surfaceSubtle: "#f1f5f9",
  textPrimary: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#94a3b8",
  borderDefault: "#e2e8f0",
  borderSubtle: "#f1f5f9",
  brandPrimary: "#0f172a",
} as const;

export const SHADOWS = {
  subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
  card: "0 1px 3px 0 rgba(15, 23, 42, 0.03), 0 1px 2px -1px rgba(15, 23, 42, 0.03)",
  elevated: "0 4px 16px -2px rgba(15, 23, 42, 0.08)",
} as const;

export const TRANSITIONS = {
  fast: "all 150ms cubic-bezier(0.4, 0, 0.2, 1)",
  normal: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
  slow: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
} as const;
