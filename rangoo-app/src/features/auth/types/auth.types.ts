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

// Wire shape per Especificação Técnica API InovaRU v2.0 (PDF assinado), seção
// 7.1 — o token vem NA RAIZ da resposta, ao lado de `usuario`.
export interface LoginResponse {
  token: string
  usuario: User
}

export interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  error: string | null
}
