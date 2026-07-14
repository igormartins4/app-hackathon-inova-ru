export interface LoginRequest {
  user: string
  password: string
}

export interface User {
  nome: string
  email: string
  isAluno: number
  isColaborador: number
}

// Wire shape per Especificação Técnica API InovaRU v2.0, seção 7.1 — o token
// vem DENTRO de `usuario`, não na raiz da resposta.
export interface LoginResponse {
  usuario: User & { token: string }
}

export interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  error: string | null
}
