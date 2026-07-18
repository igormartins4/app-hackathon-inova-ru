import type { RUInfo } from '../types/restaurante.types'

// Dados curados manualmente a partir das páginas oficiais da Fump (fump.ufmg.br),
// NÃO da API InovaRU — a especificação técnica não define endpoint de horário,
// endereço ou aviso de funcionamento dos RUs (ver docs/decisoes_ui.md). Cada
// entrada carrega `fonteUrl` e `atualizadoEm` para permitir auditoria/atualização
// manual antes de cada build. Domingo é assumido fechado (não confirmado
// explicitamente nas páginas consultadas — RUs universitários tipicamente não
// operam aos domingos).
//
// Divergência conhecida: a página geral do Programa de Alimentação lista o
// jantar do Setorial 1 até 19h, enquanto a página individual da unidade informa
// 19h30. Usamos a página individual (mais específica) como fonte principal.

export const RU_INFO: Record<string, RUInfo> = {
  '0001': {
    codigo: '0001',
    nome: 'RU Saúde/Direito',
    campus: 'Campus Saúde, Belo Horizonte',
    endereco: null,
    mapsQuery: 'Restaurante Universitário Saúde UFMG Belo Horizonte',
    temCardapio: true,
    horarios: null,
    unidadesFisicas: [
      {
        nome: 'Prédio Saúde',
        horarios: {
          0: null,
          1: {
            cafe: { abre: '07:00', fecha: '08:00' },
            almoco: { abre: '10:30', fecha: '14:00' },
            jantar: { abre: '17:10', fecha: '19:00' },
          },
          2: {
            cafe: { abre: '07:00', fecha: '08:00' },
            almoco: { abre: '10:30', fecha: '14:00' },
            jantar: { abre: '17:10', fecha: '19:00' },
          },
          3: {
            cafe: { abre: '07:00', fecha: '08:00' },
            almoco: { abre: '10:30', fecha: '14:00' },
            jantar: { abre: '17:10', fecha: '19:00' },
          },
          4: {
            cafe: { abre: '07:00', fecha: '08:00' },
            almoco: { abre: '10:30', fecha: '14:00' },
            jantar: { abre: '17:10', fecha: '19:00' },
          },
          5: {
            cafe: { abre: '07:00', fecha: '08:00' },
            almoco: { abre: '10:30', fecha: '14:00' },
            jantar: { abre: '17:10', fecha: '19:00' },
          },
          6: { almoco: { abre: '11:30', fecha: '13:00' } },
        },
      },
      {
        nome: 'Prédio Direito',
        horarios: {
          0: null,
          1: {
            cafe: { abre: '07:00', fecha: '08:00' },
            almoco: { abre: '11:00', fecha: '14:00' },
            jantar: { abre: '17:30', fecha: '19:00' },
          },
          2: {
            cafe: { abre: '07:00', fecha: '08:00' },
            almoco: { abre: '11:00', fecha: '14:00' },
            jantar: { abre: '17:30', fecha: '19:00' },
          },
          3: {
            cafe: { abre: '07:00', fecha: '08:00' },
            almoco: { abre: '11:00', fecha: '14:00' },
            jantar: { abre: '17:30', fecha: '19:00' },
          },
          4: {
            cafe: { abre: '07:00', fecha: '08:00' },
            almoco: { abre: '11:00', fecha: '14:00' },
            jantar: { abre: '17:30', fecha: '19:00' },
          },
          5: {
            cafe: { abre: '07:00', fecha: '08:00' },
            almoco: { abre: '11:00', fecha: '14:00' },
            jantar: { abre: '17:30', fecha: '19:00' },
          },
          6: null,
        },
      },
    ],
    nota: 'Café da manhã gratuito apenas para estudantes assistidos (níveis I a III). Endereço exato não publicado nas páginas oficiais consultadas.',
    fonteUrl: 'https://fump.ufmg.br/programa-de-alimentacao/',
    atualizadoEm: '2026-07-18',
  },
  '0002': {
    codigo: '0002',
    nome: 'RU Setorial 2',
    campus: 'Campus Pampulha, Belo Horizonte',
    endereco: 'Av. Antônio Carlos, 6627 – Pampulha',
    mapsQuery: 'Restaurante Universitário Setorial 2 UFMG Pampulha',
    temCardapio: true,
    horarios: {
      0: null,
      1: { cafe: { abre: '06:45', fecha: '08:00' }, almoco: { abre: '10:30', fecha: '14:00' } },
      2: { cafe: { abre: '06:45', fecha: '08:00' }, almoco: { abre: '10:30', fecha: '14:00' } },
      3: { cafe: { abre: '06:45', fecha: '08:00' }, almoco: { abre: '10:30', fecha: '14:00' } },
      4: { cafe: { abre: '06:45', fecha: '08:00' }, almoco: { abre: '10:30', fecha: '14:00' } },
      5: { cafe: { abre: '06:45', fecha: '08:00' }, almoco: { abre: '10:30', fecha: '14:00' } },
      6: null,
    },
    nota: 'Café da manhã gratuito apenas para estudantes assistidos (níveis I a III). Não serve jantar nem abre aos sábados.',
    fonteUrl: 'https://fump.ufmg.br/unidade/restaurante-universitario-setorial-ii-campus-pampulha/',
    atualizadoEm: '2026-07-18',
  },
  '0003': {
    codigo: '0003',
    nome: 'RU Setorial 1',
    campus: 'Campus Pampulha, Belo Horizonte',
    endereco: 'Rua Professor Edmundo Lins, 34, entre a FaE e o IGC – campus Pampulha',
    mapsQuery: 'Restaurante Universitário Setorial 1 UFMG Pampulha',
    temCardapio: true,
    horarios: {
      0: null,
      1: { almoco: { abre: '10:30', fecha: '14:00' }, jantar: { abre: '17:10', fecha: '19:30' } },
      2: { almoco: { abre: '10:30', fecha: '14:00' }, jantar: { abre: '17:10', fecha: '19:30' } },
      3: { almoco: { abre: '10:30', fecha: '14:00' }, jantar: { abre: '17:10', fecha: '19:30' } },
      4: { almoco: { abre: '10:30', fecha: '14:00' }, jantar: { abre: '17:10', fecha: '19:30' } },
      5: { almoco: { abre: '10:30', fecha: '14:00' }, jantar: { abre: '17:10', fecha: '19:30' } },
      6: { almoco: { abre: '11:00', fecha: '13:00' } },
    },
    nota: 'Não serve café da manhã.',
    fonteUrl: 'https://fump.ufmg.br/unidade/restaurante-universitario-setorial-i-campus-pampulha/',
    atualizadoEm: '2026-07-18',
  },
  '0004': {
    codigo: '0004',
    nome: 'RU ICA',
    campus: 'Campus Montes Claros',
    endereco: 'Av. Universitária, 1000, Bairro Universitário, CEP 39404-006 – Montes Claros/MG',
    mapsQuery: 'Restaurante Universitário ICA UFMG Montes Claros',
    temCardapio: true,
    horarios: {
      0: null,
      1: {
        cafe: { abre: '06:45', fecha: '08:00' },
        almoco: { abre: '11:00', fecha: '13:30' },
        jantar: { abre: '17:30', fecha: '19:30' },
      },
      2: {
        cafe: { abre: '06:45', fecha: '08:00' },
        almoco: { abre: '11:00', fecha: '13:30' },
        jantar: { abre: '17:30', fecha: '19:30' },
      },
      3: {
        cafe: { abre: '06:45', fecha: '08:00' },
        almoco: { abre: '11:00', fecha: '13:30' },
        jantar: { abre: '17:30', fecha: '19:30' },
      },
      4: {
        cafe: { abre: '06:45', fecha: '08:00' },
        almoco: { abre: '11:00', fecha: '13:30' },
        jantar: { abre: '17:30', fecha: '19:30' },
      },
      5: {
        cafe: { abre: '06:45', fecha: '08:00' },
        almoco: { abre: '11:00', fecha: '13:30' },
        jantar: { abre: '17:30', fecha: '19:30' },
      },
      6: { almoco: { abre: '11:15', fecha: '13:00' } },
    },
    nota: 'Café da manhã gratuito apenas para estudantes assistidos (níveis I a III).',
    fonteUrl: 'https://fump.ufmg.br/unidade/restaurante-universitario-ica-montes-claros/',
    atualizadoEm: '2026-07-18',
  },
  '0005': {
    codigo: '0005',
    nome: 'RU HRTN',
    campus: 'Hospital Risoleta Tolentino Neves, Belo Horizonte',
    endereco: null,
    mapsQuery: 'Hospital Risoleta Tolentino Neves Belo Horizonte',
    temCardapio: false,
    horarios: null,
    nota: 'Horário não publicado nas páginas oficiais consultadas — consulte a Fump.',
    fonteUrl: 'https://fump.ufmg.br/programa-de-alimentacao/',
    atualizadoEm: '2026-07-18',
  },
}
