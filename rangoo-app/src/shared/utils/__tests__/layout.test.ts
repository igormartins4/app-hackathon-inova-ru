import { toTitleCase, truncateText } from '@/shared/utils/layout'

describe('Layout utils', () => {
  describe('truncateText', () => {
    it('returns text unchanged if within limit', () => {
      expect(truncateText('hello', 10)).toBe('hello')
    })

    it('returns text unchanged if exactly at limit', () => {
      expect(truncateText('hello', 5)).toBe('hello')
    })

    it('truncates and adds ellipsis when over limit', () => {
      expect(truncateText('hello world', 5)).toBe('hell…')
    })

    it('handles empty string', () => {
      expect(truncateText('', 5)).toBe('')
    })
  })

  describe('toTitleCase', () => {
    it('converts an all-caps name to title case', () => {
      expect(toTitleCase('JOÃO DA SILVA')).toBe('João da Silva')
    })

    it('keeps lowercase connectors ("de", "da", "do", "das", "dos", "e") lowercase', () => {
      expect(toTitleCase('MARIA DOS SANTOS E SOUZA')).toBe('Maria dos Santos e Souza')
    })

    it('capitalizes the first word even if it is a connector-like word', () => {
      expect(toTitleCase('DE SOUZA')).toBe('De Souza')
    })

    it('handles a single word', () => {
      expect(toTitleCase('JOÃO')).toBe('João')
    })
  })
})
