import apiClient from "@/services/api";

export type UserRole = "SUPERADMIN" | "ADMIN" | "TREASURER" | "MEMBER";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  organization_id: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
}

/**
 * Authenticate user credentials against FastAPI backend.
 * Endpoint: POST /api/v1/auth/login
 */
export async function loginApi(payload: LoginPayload): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/auth/login", payload);
  return response.data;
}

/**
 * Fetch profile metadata for the currently authenticated user.
 * Endpoint: GET /api/v1/auth/me
 */
export async function getCurrentUserApi(): Promise<AuthUser> {
  const response = await apiClient.get<AuthUser>("/auth/me");
  return response.data;
}
