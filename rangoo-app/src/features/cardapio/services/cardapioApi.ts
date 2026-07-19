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
// Uma variação por dia da semana (0 = domingo .. 6 = sábado), pra navegar o
// calendário/trocar a refeição realmente mudar o que aparece na tela — cada
// prato principal já vem com uma alternativa vegetariana na mesma seção.
type Prato = { tipoPrato: string; descricaoPrato: string }

const ALMOCO_POR_DIA: Prato[][] = [
  // domingo
  [
    { tipoPrato: 'Prato Principal', descricaoPrato: 'Frango à parmegiana' },
    { tipoPrato: 'Prato Principal', descricaoPrato: 'Lasanha de berinjela (vegetariano)' },
    { tipoPrato: 'Entrada', descricaoPrato: 'Salada de repolho' },
    { tipoPrato: 'Acompanhamento', descricaoPrato: 'Arroz branco' },
    { tipoPrato: 'Guarnição', descricaoPrato: 'Feijão carioca' },
    { tipoPrato: 'Sobremesa', descricaoPrato: 'Pudim de leite' },
    { tipoPrato: 'Bebida', descricaoPrato: '(Copão) Suco de melancia' },
  ],
  // segunda
  [
    { tipoPrato: 'Prato Principal', descricaoPrato: 'Frango grelhado' },
    { tipoPrato: 'Prato Principal', descricaoPrato: 'Grão-de-bico ao curry (vegetariano)' },
    { tipoPrato: 'Entrada', descricaoPrato: 'Salada verde' },
    { tipoPrato: 'Acompanhamento', descricaoPrato: 'Arroz branco' },
    { tipoPrato: 'Guarnição', descricaoPrato: 'Feijão carioca' },
    { tipoPrato: 'Sobremesa', descricaoPrato: 'Doce de leite' },
    { tipoPrato: 'Bebida', descricaoPrato: '(Copão) Suco de laranja' },
  ],
  // terça
  [
    { tipoPrato: 'Prato Principal', descricaoPrato: 'Carne de panela' },
    { tipoPrato: 'Prato Principal', descricaoPrato: 'Berinjela à parmegiana (vegetariano)' },
    { tipoPrato: 'Entrada', descricaoPrato: 'Couve refogada' },
    { tipoPrato: 'Acompanhamento', descricaoPrato: 'Arroz branco' },
    { tipoPrato: 'Guarnição', descricaoPrato: 'Feijão preto' },
    { tipoPrato: 'Sobremesa', descricaoPrato: 'Gelatina' },
    { tipoPrato: 'Bebida', descricaoPrato: '(Copão) Suco de maracujá' },
  ],
  // quarta
  [
    { tipoPrato: 'Prato Principal', descricaoPrato: 'Peixe assado' },
    { tipoPrato: 'Prato Principal', descricaoPrato: 'Quibe de abóbora (vegetariano)' },
    { tipoPrato: 'Entrada', descricaoPrato: 'Salada de tomate' },
    { tipoPrato: 'Acompanhamento', descricaoPrato: 'Arroz branco' },
    { tipoPrato: 'Guarnição', descricaoPrato: 'Feijão carioca' },
    { tipoPrato: 'Sobremesa', descricaoPrato: 'Banana com canela' },
    { tipoPrato: 'Bebida', descricaoPrato: '(Copão) Suco de acerola' },
  ],
  // quinta
  [
    { tipoPrato: 'Prato Principal', descricaoPrato: 'Escondidinho de carne seca' },
    { tipoPrato: 'Prato Principal', descricaoPrato: 'Strogonoff de cogumelos (vegetariano)' },
    { tipoPrato: 'Entrada', descricaoPrato: 'Salada verde' },
    { tipoPrato: 'Acompanhamento', descricaoPrato: 'Arroz branco' },
    { tipoPrato: 'Guarnição', descricaoPrato: 'Feijão preto' },
    { tipoPrato: 'Sobremesa', descricaoPrato: 'Pudim de leite' },
    { tipoPrato: 'Bebida', descricaoPrato: '(Copão) Suco de goiaba' },
  ],
  // sexta
  [
    { tipoPrato: 'Prato Principal', descricaoPrato: 'Carne moída ao molho' },
    { tipoPrato: 'Prato Principal', descricaoPrato: 'Feijoada vegetariana' },
    { tipoPrato: 'Entrada', descricaoPrato: 'Salada de pepino' },
    { tipoPrato: 'Acompanhamento', descricaoPrato: 'Arroz branco' },
    { tipoPrato: 'Guarnição', descricaoPrato: 'Farofa' },
    { tipoPrato: 'Sobremesa', descricaoPrato: 'Doce de leite' },
    { tipoPrato: 'Bebida', descricaoPrato: '(Copão) Suco de uva' },
  ],
  // sábado
  [
    { tipoPrato: 'Prato Principal', descricaoPrato: 'Peixe à milanesa' },
    { tipoPrato: 'Prato Principal', descricaoPrato: 'Omelete de legumes (vegetariano)' },
    { tipoPrato: 'Entrada', descricaoPrato: 'Salada verde' },
    { tipoPrato: 'Acompanhamento', descricaoPrato: 'Arroz branco' },
    { tipoPrato: 'Guarnição', descricaoPrato: 'Feijão carioca' },
    { tipoPrato: 'Sobremesa', descricaoPrato: 'Gelatina' },
    { tipoPrato: 'Bebida', descricaoPrato: '(Copão) Suco de laranja' },
  ],
]

const JANTAR_POR_DIA: Prato[][] = [
  [
    { tipoPrato: 'Prato Principal', descricaoPrato: 'Frango ao molho branco' },
    { tipoPrato: 'Prato Principal', descricaoPrato: 'Tofu grelhado com legumes (vegetariano)' },
    { tipoPrato: 'Entrada', descricaoPrato: 'Legumes refogados' },
    { tipoPrato: 'Acompanhamento', descricaoPrato: 'Purê de batata' },
    { tipoPrato: 'Sobremesa', descricaoPrato: 'Gelatina' },
    { tipoPrato: 'Bebida', descricaoPrato: '(Copão) Suco de maracujá' },
  ],
  [
    { tipoPrato: 'Prato Principal', descricaoPrato: 'Peixe frito com purê' },
    { tipoPrato: 'Prato Principal', descricaoPrato: 'Panqueca de espinafre (vegetariano)' },
    { tipoPrato: 'Entrada', descricaoPrato: 'Salada de alface e tomate' },
    { tipoPrato: 'Acompanhamento', descricaoPrato: 'Purê de batata' },
    { tipoPrato: 'Sobremesa', descricaoPrato: 'Fruta da estação' },
    { tipoPrato: 'Bebida', descricaoPrato: '(Copão) Suco de laranja' },
  ],
  [
    { tipoPrato: 'Prato Principal', descricaoPrato: 'Carne de panela desfiada' },
    { tipoPrato: 'Prato Principal', descricaoPrato: 'Ratatouille (vegetariano)' },
    { tipoPrato: 'Entrada', descricaoPrato: 'Legumes refogados' },
    { tipoPrato: 'Acompanhamento', descricaoPrato: 'Arroz branco' },
    { tipoPrato: 'Sobremesa', descricaoPrato: 'Gelatina' },
    { tipoPrato: 'Bebida', descricaoPrato: '(Copão) Suco de melancia' },
  ],
  [
    { tipoPrato: 'Prato Principal', descricaoPrato: 'Omelete simples' },
    { tipoPrato: 'Prato Principal', descricaoPrato: 'Sopa de legumes (vegetariano)' },
    { tipoPrato: 'Entrada', descricaoPrato: 'Salada verde' },
    { tipoPrato: 'Acompanhamento', descricaoPrato: 'Purê de batata' },
    { tipoPrato: 'Sobremesa', descricaoPrato: 'Fruta da estação' },
    { tipoPrato: 'Bebida', descricaoPrato: '(Copão) Suco de acerola' },
  ],
  [
    { tipoPrato: 'Prato Principal', descricaoPrato: 'Frango grelhado' },
    { tipoPrato: 'Prato Principal', descricaoPrato: 'Berinjela recheada (vegetariano)' },
    { tipoPrato: 'Entrada', descricaoPrato: 'Legumes refogados' },
    { tipoPrato: 'Acompanhamento', descricaoPrato: 'Arroz branco' },
    { tipoPrato: 'Sobremesa', descricaoPrato: 'Gelatina' },
    { tipoPrato: 'Bebida', descricaoPrato: '(Copão) Suco de goiaba' },
  ],
  [
    { tipoPrato: 'Prato Principal', descricaoPrato: 'Peixe grelhado' },
    { tipoPrato: 'Prato Principal', descricaoPrato: 'Risoto de cogumelos (vegetariano)' },
    { tipoPrato: 'Entrada', descricaoPrato: 'Salada de tomate' },
    { tipoPrato: 'Acompanhamento', descricaoPrato: 'Purê de batata' },
    { tipoPrato: 'Sobremesa', descricaoPrato: 'Fruta da estação' },
    { tipoPrato: 'Bebida', descricaoPrato: '(Copão) Suco de uva' },
  ],
  [
    { tipoPrato: 'Prato Principal', descricaoPrato: 'Carne moída ao molho' },
    { tipoPrato: 'Prato Principal', descricaoPrato: 'Wrap de grão-de-bico (vegetariano)' },
    { tipoPrato: 'Entrada', descricaoPrato: 'Legumes refogados' },
    { tipoPrato: 'Acompanhamento', descricaoPrato: 'Arroz branco' },
    { tipoPrato: 'Sobremesa', descricaoPrato: 'Gelatina' },
    { tipoPrato: 'Bebida', descricaoPrato: '(Copão) Suco de laranja' },
  ],
]

function mockCardapioAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  const params = config.params as { id?: number; dataInicio?: string } | undefined
  const fumpId = params?.id ?? 6
  const dataInicio = params?.dataInicio ?? toDateParam(new Date())
  const diaSemana = new Date(`${dataInicio}T12:00:00`).getDay()

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
        refeicoes: [
          { tipoRefeicao: 'Almoço', tipo: 1, pratos: ALMOCO_POR_DIA[diaSemana] },
          { tipoRefeicao: 'Jantar', tipo: 2, pratos: JANTAR_POR_DIA[diaSemana] },
        ],
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

const VEGETARIANO_SUFFIX = /\s*\(vegetariano\)\s*$/i

function groupPratosIntoSections(pratos: Array<{ tipoPrato: string; descricaoPrato: string }>) {
  const sections = new Map<string, MenuSection>()

  for (const prato of pratos) {
    const { titulo, icon } = classifyTipoPrato(prato.tipoPrato)
    const section = sections.get(titulo) ?? { titulo, icon, itens: [] }
    const vegano = VEGETARIANO_SUFFIX.test(prato.descricaoPrato)
    section.itens.push({
      nome: prato.descricaoPrato.replace(VEGETARIANO_SUFFIX, ''),
      ...(vegano ? { vegano: true } : {}),
    })
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
