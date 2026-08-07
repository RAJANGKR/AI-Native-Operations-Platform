"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { TokenStorage } from "@/lib/token-storage";
import { registerUnauthorizedCallback } from "@/services/api";
import {
  AuthUser,
  LoginPayload,
  getCurrentUserApi,
  loginApi,
} from "@/services/auth";

export interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
}

export const AuthContext = React.createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const handleLogout = React.useCallback(() => {
    TokenStorage.clearToken();
    setUser(null);
    setAccessToken(null);
    queryClient.clear();
    if (pathname !== "/login") {
      router.push("/login");
    }
  }, [pathname, queryClient, router]);

  // Session restoration on startup
  React.useEffect(() => {
    registerUnauthorizedCallback(() => {
      handleLogout();
    });

    async function restoreSession() {
      const storedToken = TokenStorage.getToken();
      if (storedToken) {
        try {
          const currentUser = await getCurrentUserApi();
          setUser(currentUser);
          setAccessToken(storedToken);
        } catch {
          TokenStorage.clearToken();
          setUser(null);
          setAccessToken(null);
        }
      }
      setIsLoading(false);
    }

    restoreSession();
  }, [handleLogout]);

  const handleLogin = async (payload: LoginPayload) => {
    const res = await loginApi(payload);
    TokenStorage.setToken(res.access_token);
    setAccessToken(res.access_token);
    setUser(res.user);

    // Invalidate user related queries
    queryClient.invalidateQueries();
    router.push("/");
  };

  const isAuthenticated = Boolean(user && accessToken);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isAuthenticated,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
