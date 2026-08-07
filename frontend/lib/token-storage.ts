/**
 * TokenStorage Utility
 * Single point of access for JWT token persistence.
 * Designed to allow easy swapping of storage mechanisms (e.g. cookies/sessionStorage) in future milestones.
 */
const TOKEN_KEY = "apex_expense_access_token";

export const TokenStorage = {
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken(token: string): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (err) {
      console.error("Failed to save authentication token to storage:", err);
    }
  },

  clearToken(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (err) {
      console.error("Failed to clear authentication token from storage:", err);
    }
  },
};
