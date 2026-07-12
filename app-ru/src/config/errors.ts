export const ERROR_MESSAGES = {
  401: 'Usuário ou senha inválidos.',
  403: 'Acesso não autorizado. Verifique suas credenciais.',
  404: 'Recurso não encontrado. Tente novamente.',
  422: 'Valor fora do limite. Mínimo R$ 5,00 e máximo R$ 500,00.',
  429: 'Muitas tentativas. Aguarde um momento e tente de novo.',
  500: 'Ocorreu um erro. Tente novamente em instantes.',
  NETWORK: 'Sem conexão. Verifique sua internet e tente novamente.',
  EMPTY_RECHARGES: 'Você ainda não fez recargas no período.',
  EMPTY_MEALS: 'Nenhuma refeição encontrada no período.',
  INACTIVE_ACCOUNT: 'Conta inativa. Procure a FUMP para regularizar sua situação.',
} as const;

export type ErrorCode = keyof typeof ERROR_MESSAGES;
