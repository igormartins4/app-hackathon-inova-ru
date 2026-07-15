import { truncateText } from '@/shared/utils/layout'

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
})
