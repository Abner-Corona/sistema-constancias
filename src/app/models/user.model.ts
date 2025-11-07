/**
 * User model interfaces
 */

export interface User {
  id: number;
  usuario: string;
  nombre: string;
  email?: string;
  perfiles: string[];
  activo: boolean;
}

export interface LoginRequest {
  usuario: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data?: User;
  message?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}
