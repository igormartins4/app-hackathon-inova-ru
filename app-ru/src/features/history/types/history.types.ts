export interface RechargeRecord {
  id: number;
  data: string;
  valor: number;
  status: string;
}

export interface MealRecord {
  id: number;
  data: string;
  restaurante: string;
  filial: string;
  valor: number;
}

export interface HistoryResponse<T> {
  dados: T[];
  total: number;
  pagina: number;
  por_pagina: number;
}

export interface HistoryParams {
  pagina?: number;
  por_pagina?: number;
}

export interface MealHistoryParams extends HistoryParams {
  filial?: string;
}
