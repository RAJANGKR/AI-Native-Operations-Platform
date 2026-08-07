export type UserRole = "treasurer" | "member";

export interface UserPermissions {
  canCreateChapter: boolean;
  canUpdateChapter: boolean;
  canArchiveChapter: boolean;
  canCreateEvent: boolean;
  canUpdateEvent: boolean;
  canArchiveEvent: boolean;
  canManageBudgets: boolean;
  canViewAllExpenseReports: boolean;
  canCreateExpenseReport: boolean;
  canAddExpense: boolean;
  canUploadAttachment: boolean;
  canSubmitReport: boolean;
}

export function getPermissionsForRole(role: UserRole): UserPermissions {
  if (role === "treasurer") {
    return {
      canCreateChapter: true,
      canUpdateChapter: true,
      canArchiveChapter: true,
      canCreateEvent: true,
      canUpdateEvent: true,
      canArchiveEvent: true,
      canManageBudgets: true,
      canViewAllExpenseReports: true,
      canCreateExpenseReport: true,
      canAddExpense: true,
      canUploadAttachment: true,
      canSubmitReport: true,
    };
  }

  // Default Member Permissions
  return {
    canCreateChapter: false,
    canUpdateChapter: false,
    canArchiveChapter: false,
    canCreateEvent: false,
    canUpdateEvent: false,
    canArchiveEvent: false,
    canManageBudgets: false,
    canViewAllExpenseReports: false,
    canCreateExpenseReport: true,
    canAddExpense: true,
    canUploadAttachment: true,
    canSubmitReport: true,
  };
}
