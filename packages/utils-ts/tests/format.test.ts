import { describe, it, expect } from 'vitest'

import {
  formatNumber,
  roundToFirstNonZeroDecimal,
  formatShortAddress,
} from '../src/format'

describe('formatNumber', () => {
  describe('basic formatting', () => {
    it('should format whole numbers', () => {
      expect(formatNumber(1234)).toBe('1,234.00')
      expect(formatNumber(0)).toBe('0.00')
      expect(formatNumber(-5678)).toBe('-5,678.00')
    })

    it('should format decimal numbers', () => {
      expect(formatNumber(1234.56)).toBe('1,234.56')
      expect(formatNumber(0.5)).toBe('0.50')
      expect(formatNumber(-7.89)).toBe('-7.89')
    })

    it('should format strings', () => {
      expect(formatNumber('1234')).toBe('1,234.00')
      expect(formatNumber('1234.56')).toBe('1,234.56')
    })

    it('should format bigint', () => {
      expect(formatNumber(1234n)).toBe('1,234.00')
      expect(formatNumber(-5678n)).toBe('-5,678.00')
    })
  })

  describe('fractionDigits option', () => {
    it('should respect fractionDigits', () => {
      expect(formatNumber(1234.5678, { fractionDigits: 4 })).toBe('1,234.5678')
      expect(formatNumber(1234, { fractionDigits: 0 })).toBe('1,234')
      expect(formatNumber(1234.5, { fractionDigits: 3 })).toBe('1,234.500')
    })
  })

  describe('adaptiveDecimals option', () => {
    it('should adapt decimals for very small numbers', () => {
      expect(formatNumber(0.00001, { adaptiveDecimals: true })).toBe('0.00001')
      expect(
        formatNumber(0.000001, { adaptiveDecimals: true, fractionDigits: 3 }),
      ).toBe('0.000001')
    })

    it('should show zeros when adaptiveDecimals is false', () => {
      expect(
        formatNumber(0.00001, { adaptiveDecimals: false, fractionDigits: 2 }),
      ).toBe('0.00')
    })
  })

  describe('compact notation', () => {
    it('should format with K suffix', () => {
      expect(formatNumber(1500, { compact: true })).toBe('1.5K')
      expect(formatNumber(15000, { compact: true })).toBe('15.0K')
    })

    it('should format with M suffix', () => {
      expect(formatNumber(1500000, { compact: true })).toBe('1.5M')
      expect(formatNumber(15000000, { compact: true })).toBe('15.0M')
    })

    it('should format with B suffix', () => {
      expect(formatNumber(1500000000, { compact: true })).toBe('1.5B')
      expect(formatNumber(15000000000, { compact: true })).toBe('15.0B')
    })

    it('should format with T suffix', () => {
      expect(formatNumber(1500000000000, { compact: true })).toBe('1.5T')
      expect(formatNumber(15000000000000, { compact: true })).toBe('15.0T')
    })

    it('should respect fractionDigits with compact notation', () => {
      expect(formatNumber(1500, { compact: true, fractionDigits: 2 })).toBe(
        '1.50K',
      )
      expect(formatNumber(1500000, { compact: true, fractionDigits: 0 })).toBe(
        '2M',
      )
    })

    it('should use auto compact mode only for large numbers', () => {
      expect(formatNumber(1000, { compact: 'auto' })).toBe('1,000.00')
      expect(formatNumber(100000, { compact: 'auto' })).toBe('100.0K')
    })

    it('should handle negative numbers with compact notation', () => {
      expect(formatNumber(-1500, { compact: true })).toBe('-1.5K')
      expect(formatNumber(-1500000, { compact: true })).toBe('-1.5M')
    })

    it('should handle bigint with compact notation', () => {
      expect(formatNumber(1500000n, { compact: true })).toBe('1.5M')
      expect(formatNumber(-1500000000n, { compact: true })).toBe('-1.5B')
    })
  })
})

describe('roundToFirstNonZeroDecimal', () => {
  it('should handle zero', () => {
    expect(roundToFirstNonZeroDecimal(0)).toBe(0)
  })

  it('should round to first significant decimal place', () => {
    expect(roundToFirstNonZeroDecimal(0.001234)).toBe(0.001)
    expect(roundToFirstNonZeroDecimal(0.0005678)).toBe(0.0006)
    expect(roundToFirstNonZeroDecimal(0.0000123)).toBe(0.00001)
  })

  it('should preserve whole numbers', () => {
    expect(roundToFirstNonZeroDecimal(123)).toBe(123)
    expect(roundToFirstNonZeroDecimal(123.456)).toBe(123.46)
  })

  it('should handle negative numbers', () => {
    expect(roundToFirstNonZeroDecimal(-0.001234)).toBe(-0.001)
    expect(roundToFirstNonZeroDecimal(-0.0005678)).toBe(-0.0006)
  })
})

describe('formatShortAddress', () => {
  it('should format Algorand addresses', () => {
    const address = '2UEQTE5QDNXPI7M3TU44G6SYKLFWLPQO7EBZM7K7MHMQQMFI4QJPLHQFHM'
    expect(formatShortAddress(address)).toBe('2UEQT...HQFHM')
  })

  it('should use custom prefix and suffix lengths', () => {
    const address = '2UEQTE5QDNXPI7M3TU44G6SYKLFWLPQO7EBZM7K7MHMQQMFI4QJPLHQFHM'
    expect(formatShortAddress(address, 3, 4)).toBe('2UE...QFHM')
    expect(formatShortAddress(address, 10, 10)).toBe('2UEQTE5QDN...4QJPLHQFHM')
  })

  it('should handle empty and null addresses', () => {
    expect(formatShortAddress(null)).toBe('')
    expect(formatShortAddress(undefined)).toBe('')
    expect(formatShortAddress('')).toBe('')
  })
})
