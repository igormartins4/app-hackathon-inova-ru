import type { AxiosRequestConfig } from 'axios'

export type DemoScenario =
  | 'normal'
  | 'blocked'
  | 'inactive'
  | 'pixExpired'
  | 'pixRejected'
  | 'rateLimit'
  | 'serverError'

interface MockResponse {
  status: number
  data: unknown
  headers?: Record<string, string>
  statusText?: string
}

interface PaymentRecord {
  payment_id: number
  valor: number
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired'
  polls: number
  creditado: boolean
  expiration: string
}

interface RechargeRecord {
  id: number
  valor: number
  metodo: 'PIX'
  status: 'aprovado'
  data_hora: string
}

interface MealRecord {
  data_hora: string
  filial: { codigo: string; nome: string }
  quantidade: number
  valor_total: number
  gratuidade: boolean
  tipo_consumidor: string
}

const DEMO_USER = {
  nome: 'GERSON SANTOS',
  email: 'gerson@ufmg.br',
  isAluno: 1,
  isColaborador: 0,
}

const BASE_CONSUMER = {
  nome: 'GERSON SANTOS',
  tipo_consumidor: { codigo: '01', descricao: 'ESTUDANTE REGULAR' },
  centro_custo: { tipo: 'Graduação', descricao: 'SISTEMAS DE INFORMAÇÃO' },
  situacao: 'A',
}

const INITIAL_RECHARGES: RechargeRecord[] = [
  { id: 3, valor: 25, metodo: 'PIX', status: 'aprovado', data_hora: '2026-07-08T09:00:00-03:00' },
  { id: 2, valor: 30, metodo: 'PIX', status: 'aprovado', data_hora: '2026-07-10T14:15:00-03:00' },
  { id: 1, valor: 50, metodo: 'PIX', status: 'aprovado', data_hora: '2026-07-12T10:30:00-03:00' },
]

// Códigos e nomes oficiais do Anexo A da Especificação Técnica API InovaRU v2.0.
const INITIAL_MEALS: MealRecord[] = [
  {
    data_hora: '2026-07-12T12:30:00-03:00',
    filial: { codigo: '0003', nome: 'RU Setorial 1' },
    quantidade: 1,
    valor_total: 3.2,
    gratuidade: false,
    tipo_consumidor: 'ESTUDANTE REGULAR',
  },
  {
    data_hora: '2026-07-12T19:00:00-03:00',
    filial: { codigo: '0003', nome: 'RU Setorial 1' },
    quantidade: 1,
    valor_total: 3.2,
    gratuidade: false,
    tipo_consumidor: 'ESTUDANTE REGULAR',
  },
  {
    data_hora: '2026-07-11T12:15:00-03:00',
    filial: { codigo: '0002', nome: 'RU Setorial 2' },
    quantidade: 1,
    valor_total: 3.2,
    gratuidade: false,
    tipo_consumidor: 'ESTUDANTE REGULAR',
  },
]

let activeScenario: DemoScenario = 'normal'
let saldo = 45.5
let paymentId = 1000
let rechargeId = 10
let transferId = 2000
let payments = new Map<number, PaymentRecord>()
let recharges = [...INITIAL_RECHARGES]
let meals = [...INITIAL_MEALS]

export function setMockScenario(scenario: DemoScenario) {
  activeScenario = scenario
  resetMockState()
}

export function getMockScenario(): DemoScenario {
  return activeScenario
}

export function resetMockState() {
  saldo = 45.5
  paymentId = 1000
  rechargeId = 10
  transferId = 2000
  payments = new Map()
  recharges = [...INITIAL_RECHARGES]
  meals = [...INITIAL_MEALS]
}

function ok(data: unknown, status = 200, headers?: Record<string, string>): MockResponse {
  return { status, data, headers }
}

function error(status: number, message: string, headers?: Record<string, string>): MockResponse {
  return { status, data: { message }, headers, statusText: 'Error' }
}

function parseBody(config: AxiosRequestConfig): Record<string, unknown> {
  if (!config.data) return {}
  if (typeof config.data === 'string') return JSON.parse(config.data)
  return config.data as Record<string, unknown>
}

function toBrasiliaIso(date = new Date()) {
  return new Date(date.getTime() - 3 * 60 * 60 * 1000).toISOString().replace('Z', '-03:00')
}

function getQuery(url: string) {
  const query = url.includes('?') ? url.slice(url.indexOf('?') + 1) : ''
  const params = new URLSearchParams(query)
  return {
    page: Number(params.get('page') ?? 1),
    perPage: Math.min(Number(params.get('perPage') ?? 20), 100),
    dataInicio: params.get('dataInicio'),
    dataFim: params.get('dataFim'),
    filial: params.get('filial'),
  }
}

function paginate<T>(items: T[], url: string) {
  const { page, perPage } = getQuery(url)
  const currentPage = Number.isFinite(page) && page > 0 ? page : 1
  const pageSize = Number.isFinite(perPage) && perPage > 0 ? perPage : 20
  const start = (currentPage - 1) * pageSize
  const data = items.slice(start, start + pageSize)
  return {
    data,
    pagination: {
      total: items.length,
      currentPage,
      perPage: pageSize,
      lastPage: Math.max(1, Math.ceil(items.length / pageSize)),
    },
  }
}

function byDate<T extends { data_hora: string }>(items: T[], url: string): T[] {
  const { dataInicio, dataFim } = getQuery(url)
  return items.filter((item) => {
    const date = item.data_hora.slice(0, 10)
    if (dataInicio && date < dataInicio) return false
    if (dataFim && date > dataFim) return false
    return true
  })
}

function currentConsumer() {
  return {
    ...BASE_CONSUMER,
    situacao: activeScenario === 'blocked' ? 'B' : 'A',
  }
}

function completePayment(payment: PaymentRecord) {
  if (!payment.creditado) {
    saldo = Number((saldo + payment.valor).toFixed(2))
    rechargeId++
    recharges = [
      {
        id: rechargeId,
        valor: payment.valor,
        metodo: 'PIX',
        status: 'aprovado',
        data_hora: toBrasiliaIso(),
      },
      ...recharges,
    ]
    payment.creditado = true
  }
}

function getPaymentStatus(payment: PaymentRecord) {
  payment.polls++

  if (activeScenario === 'pixExpired') {
    payment.status = payment.polls >= 2 ? 'expired' : 'pending'
  } else if (activeScenario === 'pixRejected') {
    payment.status = payment.polls >= 2 ? 'rejected' : 'pending'
  } else if (payment.polls >= 3) {
    payment.status = 'approved'
    completePayment(payment)
  }

  return {
    payment_id: payment.payment_id,
    status: payment.status,
    status_detail: payment.status === 'approved' ? 'accredited' : undefined,
    creditado: payment.creditado,
  }
}

export function getMockResponse(config: AxiosRequestConfig): MockResponse {
  const url = config.url ?? ''
  const path = url.split('?')[0]
  const method = (config.method ?? 'get').toLowerCase()

  if (activeScenario === 'rateLimit') {
    return error(429, 'Muitas tentativas, aguarde um momento', { 'retry-after': '30' })
  }

  if (activeScenario === 'serverError') {
    return error(500, 'Erro interno do servidor')
  }

  if (path.includes('/usuarios/login') && method === 'post') {
    const body = parseBody(config)
    if (body.user === '00000000000' || body.password === 'errada') {
      return error(401, 'Usuário ou senha inválidos')
    }
    return ok({ usuario: { token: 'mock-jwt-token-fake-expo-ru-2026', ...DEMO_USER } })
  }

  if (path.includes('/creditos/saldo') && method === 'get') {
    if (activeScenario === 'inactive') {
      return error(404, 'Consumidor não encontrado ou inativo.')
    }
    return ok({
      consumidor: currentConsumer(),
      saldo: { credito_disponivel: saldo, limite_recarga: 500 },
    })
  }

  if (path.includes('/creditos/pagamento') && path.includes('/status') && method === 'get') {
    const match = path.match(/\/creditos\/pagamento\/(\d+)\/status/)
    const id = match ? Number(match[1]) : 0
    const payment = payments.get(id)
    if (!payment) return error(404, 'Recurso não encontrado. Tente novamente.')
    return ok(getPaymentStatus(payment))
  }

  if (path.includes('/creditos/pagamento') && method === 'post') {
    const body = parseBody(config)
    const valor = Number(body.valor ?? 0)
    if (valor < 5 || valor > 500 || saldo + valor > 500) {
      return error(422, 'Valor fora do limite permitido. Mínimo: R$ 5,00, Máximo: R$ 500,00')
    }
    paymentId++
    const payment: PaymentRecord = {
      payment_id: paymentId,
      valor,
      status: 'pending',
      polls: 0,
      creditado: false,
      expiration: toBrasiliaIso(new Date(Date.now() + 30 * 60 * 1000)),
    }
    payments.set(payment.payment_id, payment)
    return ok(
      {
        payment_id: payment.payment_id,
        status: payment.status,
        qr_code: `00020126580014br.gov.bcb.pix.mock.rangoo.${payment.payment_id}`,
        qr_code_base64: '',
        ticket_url: '',
        expiration: payment.expiration,
      },
      201,
    )
  }

  if (path.includes('/creditos/recargas') && method === 'get') {
    return ok(paginate(byDate(recharges, url), url))
  }

  if (path.includes('/creditos/refeicoes') && method === 'get') {
    const { filial } = getQuery(url)
    const filtered = byDate(meals, url).filter((meal) => !filial || meal.filial.codigo === filial)
    return ok(paginate(filtered, url))
  }

  // Bônus fora da API FUMP v2.0; mantido isolado e documentado.
  if (path.includes('/creditos/transferir') && method === 'post') {
    const body = parseBody(config)
    const valor = Number(body.valor ?? 0)
    if (valor < 5 || valor > saldo) return error(422, 'Valor fora do saldo disponível.')
    transferId++
    saldo = Number((saldo - valor).toFixed(2))
    return ok({
      transfer_id: transferId,
      status: 'approved',
      saldo_atualizado: saldo,
      destinatario_nome: 'AMIGO UFMG',
    })
  }

  return error(404, 'Recurso não encontrado. Tente novamente.')
}
