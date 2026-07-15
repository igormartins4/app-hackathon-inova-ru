import axios from 'axios'
import type {
  CardapioParams,
  CardapioResponse,
  FilialCode,
  FumpCardapioRawResponse,
  MenuSection,
} from '../types/cardapio.types'

// Integracao nao-oficial com a API publica de cardapio da FUMP (fump.ufmg.br:3003).
// Endpoint descoberto via inspecao de rede do site oficial (fump.ufmg.br/cardapio-do-dia),
// sem autenticacao, GET, dado publico. NAO faz parte do contrato assinado v2.0 —
// pode mudar ou sair do ar sem aviso; toda falha aqui deve degradar para um
// estado vazio explicito na UI, nunca para dado inventado.
const FUMP_MENU_BASE_URL = 'https://fump.ufmg.br:3003'

// Mapeamento entre o codigo de filial oficial (Anexo A) e o id numerico dessa
// API nao-oficial. RU HRTN (0005) nao tem cardapio publicado nessa API.
const FILIAL_TO_FUMP_ID: Partial<Record<FilialCode, number>> = {
  '0003': 6, // RU Setorial 1
  '0002': 1, // RU Setorial 2
  '0001': 2, // RU Saude/Direito
  '0004': 5, // RU ICA
}

const fumpMenuClient = axios.create({
  baseURL: FUMP_MENU_BASE_URL,
  timeout: 8000,
})

const TIPO_REFEICAO_MAP: Record<CardapioParams['tipoRefeicao'], string> = {
  almoco: 'Almoço',
  jantar: 'Jantar',
}

function toDateParam(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function groupPratosIntoSections(pratos: Array<{ tipoPrato: string; descricaoPrato: string }>) {
  const sections = new Map<string, MenuSection>()

  for (const prato of pratos) {
    const { titulo, icon } = classifyTipoPrato(prato.tipoPrato)
    const section = sections.get(titulo) ?? { titulo, icon, itens: [] }
    section.itens.push({ nome: prato.descricaoPrato })
    sections.set(titulo, section)
  }

  return Array.from(sections.values())
}

function classifyTipoPrato(tipoPrato: string): { titulo: string; icon: string } {
  const normalized = tipoPrato.toLowerCase()
  if (normalized.startsWith('entrada')) return { titulo: 'Entrada', icon: 'leaf' }
  if (normalized.startsWith('prato prot')) return { titulo: 'Prato Principal', icon: 'restaurant' }
  if (normalized.startsWith('acompanhamento'))
    return { titulo: 'Acompanhamento', icon: 'restaurant' }
  if (normalized.startsWith('guarni')) return { titulo: 'Guarnição', icon: 'restaurant' }
  if (normalized.startsWith('sobremesa')) return { titulo: 'Sobremesa', icon: 'ice-cream' }
  if (normalized.startsWith('(') || normalized.includes('copo'))
    return { titulo: 'Bebida', icon: 'water' }
  return { titulo: 'Outros', icon: 'restaurant' }
}

export async function fetchCardapio(params: CardapioParams): Promise<CardapioResponse> {
  const fumpId = FILIAL_TO_FUMP_ID[params.restaurante]
  if (!fumpId) {
    return {
      restaurante: params.restaurante,
      data: toDateParam(params.data),
      tipoRefeicao: params.tipoRefeicao,
      secoes: [],
    }
  }

  const dataParam = toDateParam(params.data)
  const response = await fumpMenuClient.get<FumpCardapioRawResponse>('/cardapios/cardapio', {
    params: { id: fumpId, dataInicio: dataParam, dataFim: dataParam },
  })

  const tipoRefeicaoLabel = TIPO_REFEICAO_MAP[params.tipoRefeicao]
  const refeicao = response.data.cardapios
    .find((c) => c.data.slice(0, 10) === dataParam)
    ?.refeicoes.find((r) => r.tipoRefeicao === tipoRefeicaoLabel)

  return {
    restaurante: response.data.nome,
    data: dataParam,
    tipoRefeicao: params.tipoRefeicao,
    secoes: refeicao ? groupPratosIntoSections(refeicao.pratos) : [],
  }
}
