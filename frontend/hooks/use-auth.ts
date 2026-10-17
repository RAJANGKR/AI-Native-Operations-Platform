"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AuthContext, AuthContextType } from "@/context/auth-context";
import { UserRole } from "@/services/auth";

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const role = context.user?.role?.toUpperCase();
  const isSuperadmin = role === "SUPERADMIN";
  const isTreasurerOrAdmin = role === "TREASURER" || role === "ADMIN" || isSuperadmin;
  const isAdmin = role === "ADMIN" || isSuperadmin;

  return {
    ...context,
    isTreasurerOrAdmin,
    isAdmin,
    isSuperadmin,
  };
}

export function useRequireAuth(allowedRoles?: UserRole[]) {
  const auth = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!auth.isLoading) {
      if (!auth.isAuthenticated) {
        router.push("/login");
        return;
      }

      if (allowedRoles && allowedRoles.length > 0 && auth.user) {
        const userRole = auth.user.role;
        if (userRole !== "SUPERADMIN" && !allowedRoles.includes(userRole)) {
          router.push("/");
        }
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.user, allowedRoles, router]);

  return auth;
}
