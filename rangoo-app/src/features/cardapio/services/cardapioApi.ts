import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { toDateParam } from '@/shared/utils'
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

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false'

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

// --- Mock data for cardapio (when EXPO_PUBLIC_USE_MOCK=true) ---
const MOCK_FUMP_CARDAPIO: FumpCardapioRawResponse = {
  id: 6,
  nome: 'RU Setorial 1',
  cardapios: [
    {
      data: toDateParam(new Date()),
      refeicoes: [
        {
          tipoRefeicao: 'Almoço',
          tipo: 1,
          pratos: [
            { tipoPrato: 'Prato Principal', descricaoPrato: 'Frango grelhado com arroz e feijão' },
            { tipoPrato: 'Entrada', descricaoPrato: 'Salada verde' },
            { tipoPrato: 'Sobremesa', descricaoPrato: 'Pudim de leite' },
            { tipoPrato: 'Acompanhamento', descricaoPrato: 'Arroz branco' },
            { tipoPrato: 'Guarnição', descricaoPrato: 'Vinagrete' },
            { tipoPrato: 'Bebida', descricaoPrato: '(Copão) Suco de laranja' },
          ],
        },
        {
          tipoRefeicao: 'Jantar',
          tipo: 2,
          pratos: [
            { tipoPrato: 'Prato Principal', descricaoPrato: 'Peixe frito com purê' },
            { tipoPrato: 'Entrada', descricaoPrato: 'Legumes refogados' },
            { tipoPrato: 'Sobremesa', descricaoPrato: 'Gelatina' },
            { tipoPrato: 'Acompanhamento', descricaoPrato: 'Purê de batata' },
            { tipoPrato: 'Bebida', descricaoPrato: '(Copão) Suco de maracujá' },
          ],
        },
      ],
    },
  ],
}

function mockCardapioAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  const params = config.params as { id?: number; dataInicio?: string } | undefined
  const fumpId = params?.id ?? 6
  const dataInicio = params?.dataInicio ?? toDateParam(new Date())

  const nomeMap: Record<number, string> = {
    6: 'RU Setorial 1',
    1: 'RU Setorial 2',
    2: 'RU Saúde/Direito',
    5: 'RU ICA',
  }

  const mockData: FumpCardapioRawResponse = {
    id: fumpId,
    nome: nomeMap[fumpId] ?? 'RU Desconhecido',
    cardapios: [
      {
        data: dataInicio,
        refeicoes: MOCK_FUMP_CARDAPIO.cardapios[0].refeicoes,
      },
    ],
  }

  return Promise.resolve({
    data: mockData,
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  })
}

if (USE_MOCK) {
  fumpMenuClient.defaults.adapter = mockCardapioAdapter as never
}

const TIPO_REFEICAO_MAP: Record<CardapioParams['tipoRefeicao'], string> = {
  almoco: 'Almoço',
  jantar: 'Jantar',
}

function groupPratosIntoSections(pratos: Array<{ tipoPrato: string; descricaoPrato: string }>) {
  const sections = new Map<string, MenuSection>()

  for (const prato of pratos) {
    const { titulo, icon } = classifyTipoPrato(prato.tipoPrato)
    const section = sections.get(titulo) ?? { titulo, icon, itens: [] }
    section.itens.push({ nome: prato.descricaoPrato })
    sections.set(titulo, section)
  }

  const SECTION_ORDER = [
    'Prato Principal',
    'Sobremesa',
    'Entrada',
    'Acompanhamento',
    'Guarnição',
    'Bebida',
    'Outros',
  ]

  return Array.from(sections.values()).sort((a, b) => {
    const ai = SECTION_ORDER.indexOf(a.titulo)
    const bi = SECTION_ORDER.indexOf(b.titulo)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })
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
