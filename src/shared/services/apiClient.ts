import axios from 'axios';
import { getToken } from './secureStorage';

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT from SecureStore to every request
apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize errors into user-friendly messages (PT-BR)
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const messages: Record<number, string> = {
      401: 'Usuário ou senha inválidos.',
      403: 'Acesso não autorizado. Verifique suas credenciais.',
      404: 'Recurso não encontrado. Tente novamente.',
      429: 'Muitas tentativas. Aguarde um momento e tente de novo.',
      422: 'Valor fora do limite. Mínimo R$ 5,00 e máximo R$ 500,00.',
      500: 'Ocorreu um erro. Tente novamente em instantes.',
    };
    const message = messages[status] ?? 'Ocorreu um erro. Tente novamente em instantes.';
    return Promise.reject({ ...error, userMessage: message });
  },
);
