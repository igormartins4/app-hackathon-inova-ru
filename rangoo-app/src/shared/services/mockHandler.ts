import type { AxiosRequestConfig } from 'axios'

const MOCK_USER = {
  nome: 'GERSON SANTOS',
  email: 'gerson@ufmg.br',
  isAluno: 1,
  isColaborador: 0,
}

const MOCK_BALANCE = {
  consumidor: {
    nome: 'GERSON SANTOS',
    tipo_consumidor: { codigo: '01', descricao: 'ESTUDANTE REGULAR' },
    centro_custo: { tipo: 'Graduação', descricao: 'CIENCIA DA COMPUTACAO' },
    situacao: 'A',
  },
  saldo: {
    credito_disponivel: 45.5,
    limite_recarga: 500.0,
  },
}

const MOCK_RECHARGES = {
  data: [
    {
      id: 1,
      valor: 50.0,
      metodo: 'PIX',
      status: 'aprovado',
      data_hora: '2026-07-12T10:30:00-03:00',
    },
    {
      id: 2,
      valor: 30.0,
      metodo: 'PIX',
      status: 'aprovado',
      data_hora: '2026-07-10T14:15:00-03:00',
    },
    {
      id: 3,
      valor: 25.0,
      metodo: 'PIX',
      status: 'aprovado',
      data_hora: '2026-07-08T09:00:00-03:00',
    },
  ],
  pagination: { total: 3, currentPage: 1, perPage: 10, lastPage: 1 },
}

// Códigos e nomes de filial per Anexo A (Especificação Técnica API InovaRU v2.0).
const MOCK_MEALS = {
  data: [
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
  ],
  pagination: { total: 3, currentPage: 1, perPage: 10, lastPage: 1 },
}

// Payment mock: tracks per-payment poll count to simulate pending→approved flow.
// Spec §8: polling should receive pending 2-3 times before approved+creditado.
let mockPaymentId = 1000
const mockPaymentPollCount = new Map<number, number>()

export function getMockResponse(config: AxiosRequestConfig): unknown | null {
  const url = config.url ?? ''
  const method = (config.method ?? 'get').toLowerCase()

  if (url.includes('/usuarios/login') && method === 'post') {
    // Especificação Técnica API InovaRU v2.0, seção 7.1: o token vem dentro de `usuario`.
    return {
      usuario: {
        token: 'mock-jwt-token-fake-expo-ru-2026',
        ...MOCK_USER,
      },
    }
  }

  if (url.includes('/creditos/saldo')) {
    return MOCK_BALANCE
  }

  if (url.includes('/creditos/pagamento') && url.includes('/status')) {
    // Extract paymentId from URL: /creditos/pagamento/:id/status
    const match = url.match(/\/creditos\/pagamento\/(\d+)\/status/)
    const paymentId = match ? Number(match[1]) : mockPaymentId

    const count = mockPaymentPollCount.get(paymentId) ?? 0
    mockPaymentPollCount.set(paymentId, count + 1)

    // Simulate 2-3 pending polls before approved (spec §8 + §11.2)
    if (count < 2) {
      return {
        payment_id: paymentId,
        status: 'pending',
        creditado: false,
      }
    }

    return {
      payment_id: paymentId,
      status: 'approved',
      status_detail: 'accredited',
      creditado: true,
    }
  }

  if (url.includes('/creditos/pagamento') && method === 'post') {
    mockPaymentId++
    return {
      payment_id: mockPaymentId,
      status: 'pending',
      qr_code: '00020126580014br.gov.bcb.pix.mock.rangoo.2026',
      qr_code_base64: '',
      ticket_url: '',
      expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    }
  }

  if (url.includes('/creditos/recargas')) {
    return MOCK_RECHARGES
  }

  if (url.includes('/creditos/refeicoes')) {
    return MOCK_MEALS
  }

  return null
}
