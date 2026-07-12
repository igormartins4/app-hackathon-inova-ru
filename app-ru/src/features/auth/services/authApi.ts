import { apiClient } from '@/shared/services';
import type { LoginRequest, LoginResponse } from '../types/auth.types';

export async function loginApi(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/usuarios/login', data);
  return response.data;
}
