export interface Consumidor {
  nome: string;
  tipo_consumidor: { codigo: string; descricao: string };
  centro_custo: { tipo: string; descricao: string };
  situacao: string;
}

export interface Saldo {
  credito_disponivel: number;
  limite_recarga: number;
}

export interface BalanceResponse {
  consumidor: Consumidor;
  saldo: Saldo;
}
