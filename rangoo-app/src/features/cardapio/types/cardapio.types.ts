export interface MenuItem {
  nome: string
  // Nao vem da API real da FUMP — so presente em dados de exemplo.
  vegano?: boolean
}

export interface MenuSection {
  titulo: string
  icon: string
  itens: MenuItem[]
}

// Codigos de filial conforme Anexo A da especificacao tecnica (contrato oficial v2.0).
export type FilialCode = '0001' | '0002' | '0003' | '0004' | '0005'

export interface CardapioParams {
  restaurante: FilialCode
  tipoRefeicao: 'almoco' | 'jantar'
  data: Date
}

export interface CardapioResponse {
  restaurante: string
  data: string
  tipoRefeicao: string
  secoes: MenuSection[]
}

// Shape bruto da API nao-oficial da FUMP (fump.ufmg.br:3003/cardapios/cardapio).
// Nao faz parte do contrato assinado v2.0 — endpoint publico, sem autenticacao,
// descoberto via inspecao de rede do site oficial. Pode mudar sem aviso.
export interface FumpCardapioRawResponse {
  id: number
  nome: string
  cardapios: Array<{
    data: string
    refeicoes: Array<{
      tipoRefeicao: string
      tipo: number
      pratos: Array<{ tipoPrato: string; descricaoPrato: string }>
    }>
  }>
}
