export interface MenuItem {
  nome: string
  vegano: boolean
}

export interface MenuSection {
  titulo: string
  icon: string
  itens: MenuItem[]
}

export interface CardapioParams {
  restaurante: string
  tipoRefeicao: 'almoco' | 'jantar'
  data?: string
}

export interface CardapioResponse {
  restaurante: string
  data: string
  tipoRefeicao: string
  secoes: MenuSection[]
}
