import BigNumber from 'bignumber.js'

import { formatNumber } from './format'

/**
 * Asset information required for AssetAmount
 */
export interface AssetInfo {
  /** Asset ID (ASA ID) */
  id: number | bigint
  /** Number of decimal places for the asset */
  decimals: number
  /** Short unit name (e.g., "ALGO") - optional */
  unitName?: string
  /** Full asset name (e.g., "Algorand") - optional */
  name?: string
}

/**
 * Utility class for safe, explicit conversion between microunits and standard units of any Algorand Standard Asset
 *
 * This class helps prevent precision errors when working with asset amounts by:
 * - Using BigNumber for precise decimal arithmetic
 * - Providing explicit methods for conversion between micro/standard units
 * - Making unit intentions clear in the code
 * - Tracking the asset ID and other asset information
 */
export class AssetAmount {
  private readonly _microUnits: BigNumber
  private readonly _assetInfo: AssetInfo

  /**
   * Return the amount in microunits (base units)
   */
  get microUnits(): bigint {
    return BigInt(
      this._microUnits.integerValue(BigNumber.ROUND_DOWN).toString(),
    )
  }

  /**
   * Return the amount as a BigNumber in microunits (preserving precision)
   */
  get microBigNum(): BigNumber {
    return this._microUnits
  }

  /**
   * Return the amount in standard units
   */
  get standardUnits(): number {
    return this._microUnits
      .dividedBy(new BigNumber(10).pow(this.decimals))
      .toNumber()
  }

  /**
   * Return the amount in standard units as a BigNumber (preserving precision)
   */
  get standardBigNum(): BigNumber {
    return this._microUnits.dividedBy(new BigNumber(10).pow(this.decimals))
  }

  /**
   * Return the number of decimal places for the asset
   */
  get decimals(): number {
    return this._assetInfo.decimals
  }

  /**
   * Return the asset ID
   */
  get assetId(): number | bigint {
    return this._assetInfo.id
  }

  /**
   * Return the asset information
   */
  get assetInfo(): AssetInfo {
    return this._assetInfo
  }

  /**
   * Create a new AssetAmount instance
   *
   * @param assetInfo - Information about the asset
   * @param params - An object specifying the amount in standard or microunits
   * @param params.standardUnits - The amount in standard units
   * @param params.microUnits - The amount in microunits (base units)
   * @returns A new instance of AssetAmount representing the specified amount
   *
   * @example
   * ```typescript
   * // Create 5.5 units of an asset with ID 123 and 6 decimals
   * const amount = new AssetAmount(
   *   { id: 123, decimals: 6, unitName: "XYZ" },
   *   { standardUnits: 5.5 }
   * )
   *
   * // Create from microunits
   * const amount = new AssetAmount(
   *   { id: 123, decimals: 6, unitName: "XYZ" },
   *   { microUnits: 5500000n }
   * )
   * ```
   */
  constructor(
    assetInfo: AssetInfo,
    params:
      | { standardUnits: number | BigNumber | string }
      | { microUnits: bigint | number | BigNumber | string },
  ) {
    this._assetInfo = assetInfo

    if ('standardUnits' in params) {
      // Convert from standard units to microunits
      const standardAmount = new BigNumber(params.standardUnits)
      this._microUnits = standardAmount
        .multipliedBy(new BigNumber(10).pow(this.decimals))
        .integerValue(BigNumber.ROUND_DOWN)
    } else {
      // Already in microunits
      this._microUnits = new BigNumber(params.microUnits.toString())
    }
  }

  /**
   * Returns a string representation of the asset amount
   *
   * @example
   * ```typescript
   * const amount = AssetAmount.StandardUnits({ id: 123, decimals: 6, unitName: "XYZ" }, 5.5)
   * console.log(amount.toString()) // "5.5 XYZ (5500000 microunits)"
   */
  toString(): string {
    const unitDisplay = this._assetInfo.unitName
      ? ` ${this._assetInfo.unitName}`
      : ''
    return `${this.standardBigNum.toFormat()}${unitDisplay} (${this._microUnits.toFormat(0)} microunits)`
  }

  /**
   * Format the amount for display with options
   *
   * @param options - Formatting options
   * @param options.showSymbol - Whether to include the asset symbol
   * @param options.symbol - The asset symbol to display (defaults to asset's unitName if available)
   * @param options.decimalPlaces - Number of decimal places to show
   * @param options.trimZeroes - Whether to trim trailing zeros (default: true)
   * @param options.showMicrounits - Whether to include microunits in parentheses
   *
   * @example
   * ```typescript
   * const amount = AssetAmount.MicroUnits({ id: 123, decimals: 6, unitName: "XYZ" }, 5500000n)
   * console.log(amount.format()) // "5.5"
   * console.log(amount.format({ showSymbol: true })) // "5.5 XYZ"
   * console.log(amount.format({ showMicrounits: true })) // "5.5 (5500000 microunits)"
   * console.log(amount.format({ trimZeroes: false })) // "5.500000"
   * ```
   */
  format(
    options: {
      showSymbol?: boolean
      symbol?: string
      decimalPlaces?: number
      showMicrounits?: boolean
      trimZeroes?: boolean
    } = {},
  ): string {
    const {
      showSymbol = false,
      symbol,
      decimalPlaces = this.decimals,
      showMicrounits = false,
      trimZeroes = true,
    } = options

    const formattedAmount = formatNumber(this.standardUnits, {
      fractionDigits: decimalPlaces,
      adaptiveDecimals: trimZeroes,
    })

    // Trim trailing zeros if requested
    let formattedWithZeroHandling = formattedAmount
    if (trimZeroes && formattedAmount.includes('.')) {
      formattedWithZeroHandling = formattedAmount.replace(/\.?0+$/, '')
    }

    let result = formattedWithZeroHandling

    if (showSymbol) {
      // Use provided symbol, fall back to asset's unitName, or use empty string
      const symbolToUse = symbol || this._assetInfo.unitName || ''
      result = symbolToUse
        ? `${formattedWithZeroHandling} ${symbolToUse}`
        : formattedWithZeroHandling
    }

    if (showMicrounits) {
      const formattedMicrounits = formatNumber(this.microUnits, {
        fractionDigits: 0,
        adaptiveDecimals: true,
      })
      result += ` (${formattedMicrounits} microunits)`
    }

    return result
  }

  /**
   * Allows using AssetAmount in comparison operations
   * Not recommended for conversion to number, use standardUnits or microUnits explicitly
   *
   * @example
   * ```typescript
   * const amount = AssetAmount.MicroUnits({ id: 123, decimals: 6, unitName: "XYZ" }, 5500000n)
   * console.log(amount.valueOf()) // 5500000
   * ```
   */
  valueOf(): number {
    return this._microUnits.toNumber()
  }

  /**
   * Create an AssetAmount object representing the given number of standard units
   *
   * @param assetInfo - Information about the asset
   * @param amount - The amount in standard units
   *
   * @example
   * ```typescript
   * const amount = AssetAmount.StandardUnits({ id: 123, decimals: 6, unitName: "XYZ" }, 5.5)
   * console.log(amount.microUnits) // 5500000n
   * ```
   */
  static StandardUnits(
    assetInfo: AssetInfo,
    amount: number | BigNumber | string,
  ): AssetAmount {
    return new AssetAmount(assetInfo, { standardUnits: amount })
  }

  /**
   * Create an AssetAmount object representing the given number of microunits (base units)
   *
   * @param assetInfo - Information about the asset
   * @param amount - The amount in microunits
   *
   * @example
   * ```typescript
   * const amount = AssetAmount.MicroUnits({ id: 123, decimals: 6, unitName: "XYZ" }, 5500000n)
   * console.log(amount.standardUnits) // 5.5
   * ```
   */
  static MicroUnits(
    assetInfo: AssetInfo,
    amount: bigint | number | BigNumber | string,
  ): AssetAmount {
    return new AssetAmount(assetInfo, { microUnits: amount })
  }

  /**
   * Create a zero AssetAmount for the specified asset
   *
   * @param assetInfo - Information about the asset
   *
   * @example
   * ```typescript
   * const amount = AssetAmount.zero({ id: 123, decimals: 6, unitName: "XYZ" })
   * console.log(amount.standardUnits) // 0
   * ```
   */
  static zero(assetInfo: AssetInfo): AssetAmount {
    return new AssetAmount(assetInfo, { microUnits: 0 })
  }

  /**
   * Create an AssetAmount from a currency value and asset price
   *
   * @param assetInfo - Information about the asset
   * @param currencyAmount - The amount in the currency, e.g. 100 USD
   * @param assetPrice - The price of one unit of the asset in the currency, e.g. 10 USD
   *
   * @example
   * ```typescript
   * // Using USD as currency
   * const amount = AssetAmount.fromCurrency({ id: 123, decimals: 6, unitName: "XYZ" }, 100, 10)
   * console.log(amount.standardUnits) // 10
   * ```
   */
  static fromCurrency(
    assetInfo: AssetInfo,
    currencyAmount: number | BigNumber | string,
    assetPrice: number | BigNumber | string,
  ): AssetAmount {
    const currency = new BigNumber(currencyAmount)
    const price = new BigNumber(assetPrice)

    if (price.isZero()) {
      throw new Error('Asset price cannot be zero')
    }

    const standardAmount = currency.dividedBy(price)
    return AssetAmount.StandardUnits(assetInfo, standardAmount)
  }

  /**
   * Add another AssetAmount to this one.
   * Both amounts must be in the same asset (same assetId and decimals).
   *
   * @example
   * ```typescript
   * const amount1 = AssetAmount.StandardUnits({ id: 123, decimals: 6, unitName: "XYZ" }, 5.5)
   * const amount2 = AssetAmount.StandardUnits({ id: 123, decimals: 6, unitName: "XYZ" }, 10)
   * const result = amount1.add(amount2)
   * console.log(result.standardUnits) // 15.5
   * console.log(result.microUnits) // 15500000n
   * ```
   */
  add(other: AssetAmount): AssetAmount {
    if (this.assetId !== other.assetId) {
      throw new Error(
        `Cannot add AssetAmounts with different asset IDs (${this.assetId} and ${other.assetId})`,
      )
    }

    if (this.decimals !== other.decimals) {
      throw new Error('Cannot add AssetAmounts with different decimals')
    }

    return AssetAmount.MicroUnits(
      this._assetInfo,
      this._microUnits.plus(other.microUnits.toString()),
    )
  }

  /**
   * Subtract another AssetAmount from this one.
   * Both amounts must be in the same asset (same assetId and decimals).
   *
   * @example
   * ```typescript
   * const amount1 = AssetAmount.StandardUnits({ id: 123, decimals: 6, unitName: "XYZ" }, 10)
   * const amount2 = AssetAmount.StandardUnits({ id: 123, decimals: 6, unitName: "XYZ" }, 5.5)
   * const result = amount1.subtract(amount2)
   * console.log(result.standardUnits) // 4.5
   * console.log(result.microUnits) // 4500000n
   * ```
   */
  subtract(other: AssetAmount): AssetAmount {
    if (this.assetId !== other.assetId) {
      throw new Error(
        `Cannot subtract AssetAmounts with different asset IDs (${this.assetId} and ${other.assetId})`,
      )
    }

    if (this.decimals !== other.decimals) {
      throw new Error('Cannot subtract AssetAmounts with different decimals')
    }

    return AssetAmount.MicroUnits(
      this._assetInfo,
      this._microUnits.minus(other.microUnits.toString()),
    )
  }

  /**
   * Multiply this amount by a scalar value
   *
   * @example
   * ```typescript
   * const amount = AssetAmount.StandardUnits({ id: 123, decimals: 6, unitName: "XYZ" }, 5.5)
   * const result = amount.multiply(2)
   * console.log(result.standardUnits) // 11
   * console.log(result.microUnits) // 11000000n
   * ```
   */
  multiply(scalar: number | BigNumber | string): AssetAmount {
    const multiplier = new BigNumber(scalar)
    return AssetAmount.MicroUnits(
      this._assetInfo,
      this._microUnits
        .multipliedBy(multiplier)
        .integerValue(BigNumber.ROUND_DOWN),
    )
  }

  /**
   * Divide this amount by a scalar value
   *
   * @example
   * ```typescript
   * const amount = AssetAmount.StandardUnits({ id: 123, decimals: 6, unitName: "XYZ" }, 11)
   * const result = amount.divide(2)
   * console.log(result.standardUnits) // 5.5
   * console.log(result.microUnits) // 5500000n
   */
  divide(scalar: number | BigNumber | string): AssetAmount {
    const divisor = new BigNumber(scalar)

    if (divisor.isZero()) {
      throw new Error('Division by zero')
    }

    return AssetAmount.MicroUnits(
      this._assetInfo,
      this._microUnits.dividedBy(divisor).integerValue(BigNumber.ROUND_DOWN),
    )
  }

  /**
   * Round this amount to a specific number of decimal places
   *
   * @param decimalPlaces - Number of decimal places to round to
   * @param roundingMode - Rounding mode to use (default: ROUND_HALF_UP)
   * @returns A new AssetAmount with the rounded value
   *
   * @example
   * ```typescript
   * const amount = AssetAmount.StandardUnits({ id: 123, decimals: 6, unitName: "XYZ" }, 11)
   * const result = amount.round(2)
   * console.log(result.standardUnits) // 11.00
   */
  round(
    decimalPlaces: number = 0,
    roundingMode: BigNumber.RoundingMode = BigNumber.ROUND_HALF_UP,
  ): AssetAmount {
    // If rounding to more decimal places than the asset has, just return the same amount
    if (decimalPlaces >= this.decimals) {
      return this
    }

    // Calculate how many digits to remove from microunits
    const digitsToRemove = this.decimals - decimalPlaces

    // Round at the microunit level for more precision
    const divisor = new BigNumber(10).pow(digitsToRemove)
    const rounded = this._microUnits
      .dividedBy(divisor)
      .integerValue(roundingMode)
      .multipliedBy(divisor)

    return AssetAmount.MicroUnits(this._assetInfo, rounded)
  }

  /**
   * Get this amount as a percentage of another amount.
   * Returns a number between 0 and 100.
   * Both amounts must be in the same asset (same assetId and decimals).
   *
   * @example
   * ```typescript
   * const amount1 = AssetAmount.StandardUnits({ id: 123, decimals: 6, unitName: "XYZ" }, 25)
   * const amount2 = AssetAmount.StandardUnits({ id: 123, decimals: 6, unitName: "XYZ" }, 100)
   * const result = amount1.percentageOf(amount2)
   * console.log(result) // 25
   * ```
   */
  percentageOf(other: AssetAmount): number {
    if (this.assetId !== other.assetId) {
      throw new Error(
        `Cannot compare AssetAmounts with different asset IDs (${this.assetId} and ${other.assetId})`,
      )
    }

    if (this.decimals !== other.decimals) {
      throw new Error('Cannot compare AssetAmounts with different decimals')
    }

    if (other.isZero()) {
      throw new Error('Cannot calculate percentage of zero')
    }

    return this._microUnits
      .dividedBy(other.microUnits.toString())
      .multipliedBy(100)
      .toNumber()
  }

  /**
   * Check if this amount is zero
   *
   * @example
   * ```typescript
   * const amount = AssetAmount.StandardUnits({ id: 123, decimals: 6, unitName: "XYZ" }, 0)
   * console.log(amount.isZero()) // true
   * ```
   */
  isZero(): boolean {
    return this._microUnits.isZero()
  }

  /**
   * Check if this amount is greater than zero
   *
   * @example
   * ```typescript
   * const amount = AssetAmount.StandardUnits({ id: 123, decimals: 6, unitName: "XYZ" }, 10)
   * console.log(amount.isPositive()) // true
   * ```
   */
  isPositive(): boolean {
    return this._microUnits.isPositive()
  }

  /**
   * Check if this amount is less than zero
   *
   * @example
   * ```typescript
   * const amount = AssetAmount.StandardUnits({ id: 123, decimals: 6, unitName: "XYZ" }, -10)
   * console.log(amount.isNegative()) // true
   * ```
   */
  isNegative(): boolean {
    return this._microUnits.isNegative()
  }

  /**
   * Check if this amount is greater than another AssetAmount.
   * Both amounts must be in the same asset (same assetId and decimals).
   *
   * @example
   * ```typescript
   * const amount1 = AssetAmount.StandardUnits({ id: 123, decimals: 6, unitName: "XYZ" }, 10)
   * const amount2 = AssetAmount.StandardUnits({ id: 123, decimals: 6, unitName: "XYZ" }, 5)
   * console.log(amount1.isGreaterThan(amount2)) // true
   * ```
   */
  isGreaterThan(other: AssetAmount): boolean {
    if (this.assetId !== other.assetId) {
      throw new Error(
        `Cannot compare AssetAmounts with different asset IDs (${this.assetId} and ${other.assetId})`,
      )
    }

    if (this.decimals !== other.decimals) {
      throw new Error('Cannot compare AssetAmounts with different decimals')
    }

    return this._microUnits.isGreaterThan(other.microUnits.toString())
  }

  /**
   * Check if this amount is less than another AssetAmount.
   * Both amounts must be in the same asset (same assetId and decimals).
   *
   * @example
   * ```typescript
   * const amount1 = AssetAmount.StandardUnits({ id: 123, decimals: 6, unitName: "XYZ" }, 5)
   * const amount2 = AssetAmount.StandardUnits({ id: 123, decimals: 6, unitName: "XYZ" }, 10)
   * console.log(amount1.isLessThan(amount2)) // true
   * ```
   */
  isLessThan(other: AssetAmount): boolean {
    if (this.assetId !== other.assetId) {
      throw new Error(
        `Cannot compare AssetAmounts with different asset IDs (${this.assetId} and ${other.assetId})`,
      )
    }

    if (this.decimals !== other.decimals) {
      throw new Error('Cannot compare AssetAmounts with different decimals')
    }

    return this._microUnits.isLessThan(other.microUnits.toString())
  }

  /**
   * Check if this amount is greater than or equal to another AssetAmount.
   * Both amounts must be in the same asset (same assetId and decimals).
   *
   * @example
   * ```typescript
   * const amount1 = AssetAmount.StandardUnits({ id: 123, decimals: 6, unitName: "XYZ" }, 10)
   * const amount2 = AssetAmount.StandardUnits({ id: 123, decimals: 6, unitName: "XYZ" }, 5)
   * console.log(amount1.isGreaterThanOrEqualTo(amount2)) // true
   * ```
   */
  isGreaterThanOrEqualTo(other: AssetAmount): boolean {
    if (this.assetId !== other.assetId) {
      throw new Error(
        `Cannot compare AssetAmounts with different asset IDs (${this.assetId} and ${other.assetId})`,
      )
    }

    if (this.decimals !== other.decimals) {
      throw new Error('Cannot compare AssetAmounts with different decimals')
    }

    return this._microUnits.isGreaterThanOrEqualTo(other.microUnits.toString())
  }

  /**
   * Check if this amount is less than or equal to another AssetAmount.
   * Both amounts must be in the same asset (same assetId and decimals).
   *
   * @example
   * ```typescript
   * const amount1 = AssetAmount.StandardUnits({ id: 123, decimals: 6, unitName: "XYZ" }, 5)
   * const amount2 = AssetAmount.StandardUnits({ id: 123, decimals: 6, unitName: "XYZ" }, 10)
   * console.log(amount1.isLessThanOrEqualTo(amount2)) // true
   * ```
   */
  isLessThanOrEqualTo(other: AssetAmount): boolean {
    if (this.assetId !== other.assetId) {
      throw new Error(
        `Cannot compare AssetAmounts with different asset IDs (${this.assetId} and ${other.assetId})`,
      )
    }

    if (this.decimals !== other.decimals) {
      throw new Error('Cannot compare AssetAmounts with different decimals')
    }

    return this._microUnits.isLessThanOrEqualTo(other.microUnits.toString())
  }

  /**
   * Check if this amount is exactly the same as another AssetAmount.
   * Both amounts must be in the same asset (same assetId and decimals).
   *
   * @example
   * ```typescript
   * const amount1 = AssetAmount.StandardUnits({ id: 123, decimals: 6, unitName: "XYZ" }, 10)
   * const amount2 = AssetAmount.StandardUnits({ id: 123, decimals: 6, unitName: "XYZ" }, 10)
   * console.log(amount1.equals(amount2)) // true
   * ```
   */
  equals(other: AssetAmount): boolean {
    return (
      this.assetId === other.assetId &&
      this.decimals === other.decimals &&
      this._microUnits.isEqualTo(other.microUnits.toString())
    )
  }

  /**
   * Convert the asset amount to a JSON-compatible representation
   *
   * @example
   * ```typescript
   * const amount = AssetAmount.StandardUnits({ id: 123, decimals: 6, unitName: "XYZ" }, 10)
   * console.log(amount.toJSON()) // { assetInfo: { id: 123, decimals: 6, unitName: "XYZ" }, microUnits: "10" }
   * ```
   */
  toJSON(): { assetInfo: AssetInfo; microUnits: string } {
    return {
      assetInfo: this._assetInfo,
      microUnits: this._microUnits.toString(),
    }
  }

  /**
   * Create an AssetAmount from a JSON representation
   *
   * @example
   * ```typescript
   * const json = { assetInfo: { id: 123, decimals: 6, unitName: "XYZ" }, microUnits: "10" }
   * const amount = AssetAmount.fromJSON(json)
   * console.log(amount.standardUnits) // 10
   * ```
   */
  static fromJSON(json: {
    assetInfo: AssetInfo
    microUnits: string
  }): AssetAmount {
    return AssetAmount.MicroUnits(json.assetInfo, json.microUnits)
  }
}
