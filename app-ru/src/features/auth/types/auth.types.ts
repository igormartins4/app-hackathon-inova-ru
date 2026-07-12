export interface LoginRequest {
  user: string;
  password: string;
}

export interface User {
  nome: string;
  email: string;
  isAluno: number;
  isColaborador: number;
}

export interface LoginResponse {
  token: string;
  usuario: User;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
}
