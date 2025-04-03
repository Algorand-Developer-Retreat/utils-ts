# @txnlab/utils-ts

Utility library for Algorand development providing asset amount handling and formatting utilities.

## Installation

```bash
# npm
npm install @txnlab/utils-ts

# yarn
yarn add @txnlab/utils-ts

# pnpm
pnpm add @txnlab/utils-ts
```

## Features

### AssetAmount

Utility class for safe, explicit conversion between microunits and standard units of Algorand Standard Assets. Based on and intended as a companion to the [`AlgoAmount` class in AlgoKit Utils](https://github.com/algorandfoundation/algokit-utils-ts/blob/main/src/types/amount.ts), but extended to support any Algorand Standard Asset:

- Prevents precision errors when working with asset amounts
- Uses BigNumber for precise decimal arithmetic
- Provides explicit methods for conversion between micro/standard units
- Makes unit intentions clear in your code
- Tracks asset ID and other asset information
- Supports arithmetic, comparison, and formatting operations

```typescript
import { AssetAmount } from '@txnlab/utils-ts'

// Asset information
const asset = {
  id: 123,
  decimals: 6,
  unitName: 'XYZ',
  name: 'XYZ Token',
}

// Create from standard units (e.g. 5.5)
const amount = AssetAmount.StandardUnits(asset, 5.5)
console.log(amount.microUnits) // 5500000n

// Create from microunits
const amount2 = AssetAmount.MicroUnits(asset, 5500000n)
console.log(amount2.standardUnits) // 5.5

// Arithmetic operations
const sum = amount.add(amount2)
const difference = amount.subtract(amount2)
const doubled = amount.multiply(2)
const halved = amount.divide(2)

// Formatting
console.log(amount.format()) // "5.5"
console.log(amount.format({ showSymbol: true })) // "5.5 XYZ"
```

### Formatting Utilities

```typescript
import { formatNumber, formatShortAddress } from '@txnlab/utils-ts'

// Number formatting
formatNumber(1234.56) // "1,234.56"
formatNumber(1500000, { compact: true }) // "1.5M"
formatNumber(0.00001, { adaptiveDecimals: true }) // "0.00001"

// Algorand address formatting
const address = '2UEQTE5QDNXPI7M3TU44G6SYKLFWLPQO7EBZM7K7MHMQQMFI4QJPLHQFHM'
formatShortAddress(address) // "2UEQT...HQFHM"
```

## API Reference

### AssetAmount Class

```typescript
// Types
interface AssetInfo {
  id: number | bigint;
  decimals: number;
  unitName?: string;
  name?: string;
}

// Static constructors
AssetAmount.StandardUnits(assetInfo: AssetInfo, amount: number | BigNumber | string): AssetAmount
AssetAmount.MicroUnits(assetInfo: AssetInfo, amount: bigint | number | BigNumber | string): AssetAmount
AssetAmount.zero(assetInfo: AssetInfo): AssetAmount
AssetAmount.fromCurrency(assetInfo: AssetInfo, currencyAmount: number | BigNumber | string, assetPrice: number | BigNumber | string): AssetAmount

// Instance properties
amount.microUnits: bigint
amount.standardUnits: number
amount.microBigNum: BigNumber
amount.standardBigNum: BigNumber
amount.decimals: number
amount.assetId: number | bigint
amount.assetInfo: AssetInfo

// Instance methods
amount.add(other: AssetAmount): AssetAmount
amount.subtract(other: AssetAmount): AssetAmount
amount.multiply(scalar: number | BigNumber | string): AssetAmount
amount.divide(scalar: number | BigNumber | string): AssetAmount
amount.round(decimalPlaces?: number, roundingMode?: BigNumber.RoundingMode): AssetAmount
amount.percentageOf(other: AssetAmount): number
amount.format(options?: { showSymbol?: boolean, symbol?: string, decimalPlaces?: number, showMicrounits?: boolean, trimZeroes?: boolean }): string
amount.isZero(): boolean
amount.isPositive(): boolean
amount.isNegative(): boolean
amount.isGreaterThan(other: AssetAmount): boolean
amount.isLessThan(other: AssetAmount): boolean
amount.isGreaterThanOrEqualTo(other: AssetAmount): boolean
amount.isLessThanOrEqualTo(other: AssetAmount): boolean
amount.equals(other: AssetAmount): boolean
amount.toString(): string
amount.valueOf(): number
amount.toJSON(): { assetInfo: AssetInfo, microUnits: string }
```

### Format Functions

```typescript
// Format a number with various options
formatNumber(
  amount: string | number | bigint,
  options?: {
    style?: 'currency' | 'decimal';
    compact?: boolean | 'auto';
    fractionDigits?: number;
    adaptiveDecimals?: boolean;
  }
): string

// Round a number to the first non-zero decimal place
roundToFirstNonZeroDecimal(num: number): number

// Format an Algorand address to show first and last few characters
formatShortAddress(
  address?: string | null,
  prefixLength?: number,
  suffixLength?: number
): string
```

## License

MIT License
