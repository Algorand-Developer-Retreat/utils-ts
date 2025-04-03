import BigNumber from 'bignumber.js'
import { describe, it, expect } from 'vitest'

import { AssetAmount, AssetInfo } from '../src/asset-amount'

describe('AssetAmount', () => {
  // Test fixture with common asset info
  const assetInfo: AssetInfo = {
    id: 123,
    decimals: 6,
    unitName: 'XYZ',
    name: 'XYZ Token',
  }

  describe('constructors', () => {
    it('should create from standard units', () => {
      const amount = new AssetAmount(assetInfo, { standardUnits: 5.5 })
      expect(amount.standardUnits).toBe(5.5)
      expect(amount.microUnits).toBe(5500000n)
      expect(amount.assetId).toBe(123)
      expect(amount.decimals).toBe(6)
      expect(amount.assetInfo).toEqual(assetInfo)
    })

    it('should create from microunits', () => {
      const amount = new AssetAmount(assetInfo, { microUnits: 5500000n })
      expect(amount.standardUnits).toBe(5.5)
      expect(amount.microUnits).toBe(5500000n)
    })

    it('should create from string values', () => {
      const amount = new AssetAmount(assetInfo, { standardUnits: '5.5' })
      expect(amount.standardUnits).toBe(5.5)
      expect(amount.microUnits).toBe(5500000n)
    })

    it('should create from BigNumber values', () => {
      const amount = new AssetAmount(assetInfo, {
        standardUnits: new BigNumber(5.5),
      })
      expect(amount.standardUnits).toBe(5.5)
      expect(amount.microUnits).toBe(5500000n)
    })

    it('should round down fractional microunits', () => {
      const amount = new AssetAmount(assetInfo, { standardUnits: 5.5123456 })
      expect(amount.standardUnits).toBeCloseTo(5.512345, 6)
      expect(amount.microUnits).toBe(5512345n)
    })
  })

  describe('static constructors', () => {
    it('should create from StandardUnits', () => {
      const amount = AssetAmount.StandardUnits(assetInfo, 5.5)
      expect(amount.standardUnits).toBe(5.5)
      expect(amount.microUnits).toBe(5500000n)
    })

    it('should create from MicroUnits', () => {
      const amount = AssetAmount.MicroUnits(assetInfo, 5500000n)
      expect(amount.standardUnits).toBe(5.5)
      expect(amount.microUnits).toBe(5500000n)
    })

    it('should create zero amount', () => {
      const amount = AssetAmount.zero(assetInfo)
      expect(amount.standardUnits).toBe(0)
      expect(amount.microUnits).toBe(0n)
    })

    it('should create from currency amount and price', () => {
      const amountInUsd = 100
      const usdPrice = 10
      const amount = AssetAmount.fromCurrency(assetInfo, amountInUsd, usdPrice)
      expect(amount.standardUnits).toBe(10)
      expect(amount.microUnits).toBe(10000000n)
    })

    it('should throw when creating from currency with zero price', () => {
      expect(() => AssetAmount.fromCurrency(assetInfo, 100, 0)).toThrow(
        'Asset price cannot be zero',
      )
    })

    it('should handle extreme values', () => {
      // Test with large values
      const largeAmount = AssetAmount.StandardUnits(assetInfo, 1e12)
      expect(largeAmount.microUnits).toBe(BigInt('1000000000000000000'))

      // Test with small values
      const smallAmount = AssetAmount.StandardUnits(assetInfo, 1e-6)
      expect(smallAmount.microUnits).toBe(1n)
    })

    it('should handle zero decimal asset', () => {
      const zeroDecimalAsset: AssetInfo = {
        id: 123,
        decimals: 0,
        unitName: 'NFT',
      }
      const amount = AssetAmount.StandardUnits(zeroDecimalAsset, 5)
      expect(amount.microUnits).toBe(5n)
      expect(amount.standardUnits).toBe(5)
    })
  })

  describe('accessors', () => {
    it('should return correct microUnits', () => {
      const amount = AssetAmount.StandardUnits(assetInfo, 5.5)
      expect(amount.microUnits).toBe(5500000n)
    })

    it('should return correct microBigNum (BigNumber)', () => {
      const amount = AssetAmount.StandardUnits(assetInfo, 5.5)
      expect(amount.microBigNum.isEqualTo('5500000')).toBe(true)
    })

    it('should return correct standardUnits', () => {
      const amount = AssetAmount.MicroUnits(assetInfo, 5500000n)
      expect(amount.standardUnits).toBe(5.5)
    })

    it('should return correct standardBigNum (BigNumber)', () => {
      const amount = AssetAmount.MicroUnits(assetInfo, 5500000n)
      expect(amount.standardBigNum.isEqualTo('5.5')).toBe(true)
    })

    it('should return correct asset information', () => {
      const amount = AssetAmount.StandardUnits(assetInfo, 5.5)
      expect(amount.assetId).toBe(123)
      expect(amount.decimals).toBe(6)
      expect(amount.assetInfo).toEqual(assetInfo)
    })
  })

  describe('formatting', () => {
    it('should format with default options (trimmed)', () => {
      const amount = AssetAmount.StandardUnits(assetInfo, 5.5)
      expect(amount.format()).toBe('5.5')
    })

    it('should format with trailing zeros when trimZeroes is false', () => {
      const amount = AssetAmount.StandardUnits(assetInfo, 5.5)
      expect(amount.format({ trimZeroes: false })).toBe('5.500000')
    })

    it('should format with symbol (trimmed)', () => {
      const amount = AssetAmount.StandardUnits(assetInfo, 5.5)
      expect(amount.format({ showSymbol: true })).toBe('5.5 XYZ')
    })

    it('should format with symbol and trailing zeros', () => {
      const amount = AssetAmount.StandardUnits(assetInfo, 5.5)
      expect(amount.format({ showSymbol: true, trimZeroes: false })).toBe(
        '5.500000 XYZ',
      )
    })

    it('should format with custom symbol (trimmed)', () => {
      const amount = AssetAmount.StandardUnits(assetInfo, 5.5)
      expect(amount.format({ showSymbol: true, symbol: 'ABC' })).toBe('5.5 ABC')
    })

    it('should format with microunits (trimmed)', () => {
      const amount = AssetAmount.StandardUnits(assetInfo, 5.5)
      expect(amount.format({ showMicrounits: true })).toBe(
        '5.5 (5,500,000 microunits)',
      )
    })

    it('should format with specified decimal places (trimmed)', () => {
      const amount = AssetAmount.StandardUnits(assetInfo, 5.543)
      expect(amount.format({ decimalPlaces: 3 })).toBe('5.543')
    })

    it('should format with specified decimal places but no trimming', () => {
      const amount = AssetAmount.StandardUnits(assetInfo, 5.5)
      expect(amount.format({ decimalPlaces: 3, trimZeroes: false })).toBe(
        '5.500',
      )
    })
  })

  describe('conversion', () => {
    it('should convert to string', () => {
      const amount = AssetAmount.StandardUnits(assetInfo, 5.5)
      expect(amount.toString()).toBe('5.5 XYZ (5,500,000 microunits)')
    })

    it('should convert to string without unitName', () => {
      const assetWithoutUnit: AssetInfo = { id: 123, decimals: 6 }
      const amount = AssetAmount.StandardUnits(assetWithoutUnit, 5.5)
      expect(amount.toString()).toBe('5.5 (5,500,000 microunits)')
    })

    it('should convert to number via valueOf', () => {
      const amount = AssetAmount.MicroUnits(assetInfo, 5500000n)
      expect(amount.valueOf()).toBe(5500000)
    })

    it('should serialize to JSON', () => {
      const amount = AssetAmount.StandardUnits(assetInfo, 5.5)
      const json = amount.toJSON()
      expect(json).toEqual({
        assetInfo,
        microUnits: '5500000',
      })
    })

    it('should deserialize from JSON', () => {
      const json = {
        assetInfo,
        microUnits: '5500000',
      }
      const amount = AssetAmount.fromJSON(json)
      expect(amount.standardUnits).toBe(5.5)
      expect(amount.microUnits).toBe(5500000n)
    })
  })

  describe('arithmetic operations', () => {
    it('should add two asset amounts', () => {
      const amount1 = AssetAmount.StandardUnits(assetInfo, 5.5)
      const amount2 = AssetAmount.StandardUnits(assetInfo, 10)
      const result = amount1.add(amount2)
      expect(result.standardUnits).toBe(15.5)
      expect(result.microUnits).toBe(15500000n)
    })

    it('should throw when adding different assets', () => {
      const amount1 = AssetAmount.StandardUnits(assetInfo, 5.5)
      const amount2 = AssetAmount.StandardUnits({ id: 456, decimals: 6 }, 10)
      expect(() => amount1.add(amount2)).toThrow(
        'Cannot add AssetAmounts with different asset IDs',
      )
    })

    it('should throw when adding assets with different decimals', () => {
      const amount1 = AssetAmount.StandardUnits(assetInfo, 5.5)
      const amount2 = AssetAmount.StandardUnits({ id: 123, decimals: 8 }, 10)
      expect(() => amount1.add(amount2)).toThrow(
        'Cannot add AssetAmounts with different decimals',
      )
    })

    it('should subtract two asset amounts', () => {
      const amount1 = AssetAmount.StandardUnits(assetInfo, 10)
      const amount2 = AssetAmount.StandardUnits(assetInfo, 5.5)
      const result = amount1.subtract(amount2)
      expect(result.standardUnits).toBe(4.5)
      expect(result.microUnits).toBe(4500000n)
    })

    it('should throw when subtracting different assets', () => {
      const amount1 = AssetAmount.StandardUnits(assetInfo, 10)
      const amount2 = AssetAmount.StandardUnits({ id: 456, decimals: 6 }, 5.5)
      expect(() => amount1.subtract(amount2)).toThrow(
        'Cannot subtract AssetAmounts with different asset IDs',
      )
    })

    it('should throw when subtracting assets with different decimals', () => {
      const amount1 = AssetAmount.StandardUnits(assetInfo, 10)
      const amount2 = AssetAmount.StandardUnits({ id: 123, decimals: 8 }, 5.5)
      expect(() => amount1.subtract(amount2)).toThrow(
        'Cannot subtract AssetAmounts with different decimals',
      )
    })

    it('should multiply by scalar', () => {
      const amount = AssetAmount.StandardUnits(assetInfo, 5.5)
      const result = amount.multiply(2)
      expect(result.standardUnits).toBe(11)
      expect(result.microUnits).toBe(11000000n)
    })

    it('should divide by scalar', () => {
      const amount = AssetAmount.StandardUnits(assetInfo, 11)
      const result = amount.divide(2)
      expect(result.standardUnits).toBe(5.5)
      expect(result.microUnits).toBe(5500000n)
    })

    it('should throw when dividing by zero', () => {
      const amount = AssetAmount.StandardUnits(assetInfo, 11)
      expect(() => amount.divide(0)).toThrow('Division by zero')
    })

    it('should round to specific decimal places', () => {
      const amount = AssetAmount.StandardUnits(assetInfo, 5.55555)
      const roundedTo2 = amount.round(2)
      expect(roundedTo2.standardUnits).toBeCloseTo(5.56, 2)
      expect(roundedTo2.microUnits).toBe(5560000n)
    })

    it('should not change when rounding to more decimal places than asset has', () => {
      const amount = AssetAmount.StandardUnits(assetInfo, 5.55555)
      const rounded = amount.round(8)
      expect(rounded.standardUnits).toBeCloseTo(5.55555, 5)
      expect(rounded.microUnits).toBe(5555550n)
    })

    it('should calculate percentage', () => {
      const amount1 = AssetAmount.StandardUnits(assetInfo, 25)
      const amount2 = AssetAmount.StandardUnits(assetInfo, 100)
      expect(amount1.percentageOf(amount2)).toBe(25)
    })

    it('should throw when calculating percentage of different assets', () => {
      const amount1 = AssetAmount.StandardUnits(assetInfo, 25)
      const amount2 = AssetAmount.StandardUnits({ id: 456, decimals: 6 }, 100)
      expect(() => amount1.percentageOf(amount2)).toThrow(
        'Cannot compare AssetAmounts with different asset IDs',
      )
    })

    it('should throw when calculating percentage of zero', () => {
      const amount1 = AssetAmount.StandardUnits(assetInfo, 25)
      const amount2 = AssetAmount.zero(assetInfo)
      expect(() => amount1.percentageOf(amount2)).toThrow(
        'Cannot calculate percentage of zero',
      )
    })

    it('should handle chain operations', () => {
      const amount = AssetAmount.StandardUnits(assetInfo, 10)
      const result = amount
        .add(AssetAmount.StandardUnits(assetInfo, 5))
        .multiply(2)
        .divide(3)
        .round(2)

      expect(result.standardUnits).toBeCloseTo(10, 2)
      expect(result.microUnits).toBe(10000000n)
    })

    it('should handle negative results from subtraction', () => {
      const amount1 = AssetAmount.StandardUnits(assetInfo, 5)
      const amount2 = AssetAmount.StandardUnits(assetInfo, 10)
      const result = amount1.subtract(amount2)

      expect(result.standardUnits).toBe(-5)
      expect(result.microUnits).toBe(-5000000n)
      expect(result.isNegative()).toBe(true)
    })

    it('should handle different rounding modes', () => {
      const amount = AssetAmount.StandardUnits(assetInfo, 5.555555)

      const roundedDown = amount.round(2, BigNumber.ROUND_DOWN)
      expect(roundedDown.standardUnits).toBeCloseTo(5.55, 2)

      const roundedUp = amount.round(2, BigNumber.ROUND_UP)
      expect(roundedUp.standardUnits).toBeCloseTo(5.56, 2)

      const roundedCeil = amount.round(2, BigNumber.ROUND_CEIL)
      expect(roundedCeil.standardUnits).toBeCloseTo(5.56, 2)

      const roundedFloor = amount.round(2, BigNumber.ROUND_FLOOR)
      expect(roundedFloor.standardUnits).toBeCloseTo(5.55, 2)
    })
  })

  describe('comparison operations', () => {
    it('should check if amount is zero', () => {
      expect(AssetAmount.zero(assetInfo).isZero()).toBe(true)
      expect(AssetAmount.StandardUnits(assetInfo, 5).isZero()).toBe(false)
    })

    it('should check if amount is positive', () => {
      expect(AssetAmount.StandardUnits(assetInfo, 5).isPositive()).toBe(true)
      expect(AssetAmount.zero(assetInfo).isPositive()).toBe(true)
      // Create negative amount by subtraction
      const negative = AssetAmount.StandardUnits(assetInfo, 5).subtract(
        AssetAmount.StandardUnits(assetInfo, 10),
      )
      expect(negative.isPositive()).toBe(false)
    })

    it('should check if amount is negative', () => {
      expect(AssetAmount.StandardUnits(assetInfo, 5).isNegative()).toBe(false)
      expect(AssetAmount.zero(assetInfo).isNegative()).toBe(false)
      // Create negative amount by subtraction
      const negative = AssetAmount.StandardUnits(assetInfo, 5).subtract(
        AssetAmount.StandardUnits(assetInfo, 10),
      )
      expect(negative.isNegative()).toBe(true)
    })

    it('should compare greater than', () => {
      const amount1 = AssetAmount.StandardUnits(assetInfo, 10)
      const amount2 = AssetAmount.StandardUnits(assetInfo, 5)
      expect(amount1.isGreaterThan(amount2)).toBe(true)
      expect(amount2.isGreaterThan(amount1)).toBe(false)
      expect(amount1.isGreaterThan(amount1)).toBe(false)
    })

    it('should throw when comparing greater than with different assets', () => {
      const amount1 = AssetAmount.StandardUnits(assetInfo, 10)
      const amount2 = AssetAmount.StandardUnits({ id: 456, decimals: 6 }, 5)
      expect(() => amount1.isGreaterThan(amount2)).toThrow(
        'Cannot compare AssetAmounts with different asset IDs',
      )
    })

    it('should compare less than', () => {
      const amount1 = AssetAmount.StandardUnits(assetInfo, 5)
      const amount2 = AssetAmount.StandardUnits(assetInfo, 10)
      expect(amount1.isLessThan(amount2)).toBe(true)
      expect(amount2.isLessThan(amount1)).toBe(false)
      expect(amount1.isLessThan(amount1)).toBe(false)
    })

    it('should throw when comparing less than with different assets', () => {
      const amount1 = AssetAmount.StandardUnits(assetInfo, 5)
      const amount2 = AssetAmount.StandardUnits({ id: 456, decimals: 6 }, 10)
      expect(() => amount1.isLessThan(amount2)).toThrow(
        'Cannot compare AssetAmounts with different asset IDs',
      )
    })

    it('should compare greater than or equal', () => {
      const amount1 = AssetAmount.StandardUnits(assetInfo, 10)
      const amount2 = AssetAmount.StandardUnits(assetInfo, 5)
      const amount3 = AssetAmount.StandardUnits(assetInfo, 10)
      expect(amount1.isGreaterThanOrEqualTo(amount2)).toBe(true)
      expect(amount1.isGreaterThanOrEqualTo(amount3)).toBe(true)
      expect(amount2.isGreaterThanOrEqualTo(amount1)).toBe(false)
    })

    it('should compare less than or equal', () => {
      const amount1 = AssetAmount.StandardUnits(assetInfo, 5)
      const amount2 = AssetAmount.StandardUnits(assetInfo, 10)
      const amount3 = AssetAmount.StandardUnits(assetInfo, 5)
      expect(amount1.isLessThanOrEqualTo(amount2)).toBe(true)
      expect(amount1.isLessThanOrEqualTo(amount3)).toBe(true)
      expect(amount2.isLessThanOrEqualTo(amount1)).toBe(false)
    })

    it('should check for equality', () => {
      const amount1 = AssetAmount.StandardUnits(assetInfo, 10)
      const amount2 = AssetAmount.StandardUnits(assetInfo, 10)
      const amount3 = AssetAmount.StandardUnits(assetInfo, 5)
      expect(amount1.equals(amount2)).toBe(true)
      expect(amount1.equals(amount3)).toBe(false)
    })

    it('should return false for equality with different asset ids', () => {
      const amount1 = AssetAmount.StandardUnits(assetInfo, 10)
      const amount2 = AssetAmount.StandardUnits(
        { id: 456, decimals: 6, unitName: 'XYZ' },
        10,
      )
      expect(amount1.equals(amount2)).toBe(false)
    })

    it('should return false for equality with different decimals', () => {
      const amount1 = AssetAmount.StandardUnits(assetInfo, 10)
      const amount2 = AssetAmount.StandardUnits(
        { id: 123, decimals: 8, unitName: 'XYZ' },
        10,
      )
      expect(amount1.equals(amount2)).toBe(false)
    })
  })
})
