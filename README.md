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

## Quick Start

```typescript
import { AssetAmount, formatNumber, formatShortAddress } from '@txnlab/utils-ts'

// AssetAmount example
const algo = {
  id: 0,
  decimals: 6,
  unitName: 'ALGO',
  name: 'Algorand',
}

// Create an asset amount of 5.5 ALGO
const amount = AssetAmount.StandardUnits(algo, 5.5)
console.log(amount.microUnits) // 5500000n (microAlgos)
console.log(amount.format({ showSymbol: true })) // "5.5 ALGO"

// Number formatting
formatNumber(1234.56) // "1,234.56"
formatNumber(1500000, { compact: true }) // "1.5M"

// Address formatting
formatShortAddress('2UEQTE5QDNXPI7M3TU44G6SYKLFWLPQO7EBZM7K7MHMQQMFI4QJPLHQFHM') // "2UEQT...HQFHM"
```

## Usage Examples

### AssetAmount

Safely handle Algorand asset amounts with precision. Based on and intended as a companion to the [`AlgoAmount` class in AlgoKit Utils](https://github.com/algorandfoundation/algokit-utils-ts/blob/main/src/types/amount.ts), but extended to support any Algorand Standard Asset:

```typescript
import { AssetAmount } from '@txnlab/utils-ts'

// Define asset info
const usdc = {
  id: 31566704,
  decimals: 6,
  unitName: 'USDC',
  name: 'USD Coin',
}

// Create from standard units (dollars)
const amount = AssetAmount.StandardUnits(usdc, 100)

// Create from microunits (the base unit used on-chain)
const sameAmount = AssetAmount.MicroUnits(usdc, 100_000_000n)

// Arithmetic operations
const total = amount.add(sameAmount)
console.log(total.standardUnits) // 200
console.log(total.microUnits) // 200000000n

// Compare amounts
if (amount.isLessThan(total)) {
  console.log('Amount is less than total')
}

// Format for display
console.log(amount.format({ showSymbol: true })) // "100 USDC"
```

### Formatting Utilities

Format numbers and addresses for display:

```typescript
import { formatNumber, formatShortAddress } from '@txnlab/utils-ts'

// Basic number formatting
formatNumber(1234.56) // "1,234.56"

// Compact notation for large numbers
formatNumber(1500000, { compact: true }) // "1.5M"
formatNumber(1200000000, { compact: true }) // "1.2B"

// Control decimal places
formatNumber(123.456, { fractionDigits: 1 }) // "123.5"
formatNumber(123, { fractionDigits: 4 }) // "123.0000"

// Adaptive decimals for very small numbers
formatNumber(0.00001, { adaptiveDecimals: true }) // "0.00001"

// Format Algorand addresses
const address = '2UEQTE5QDNXPI7M3TU44G6SYKLFWLPQO7EBZM7K7MHMQQMFI4QJPLHQFHM'
formatShortAddress(address) // "2UEQT...HQFHM"
formatShortAddress(address, 3, 4) // "2UE...QFHM"
```

## Package

- [@txnlab/utils-ts](./packages/utils-ts) - Utility library for Algorand development providing asset amount handling and formatting functions

## Development

This project uses PNPM workspaces. To get started:

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint

# Format code
pnpm format
```

## Contributing

Please see our [Contributing Guidelines](./CONTRIBUTING.md) for more details on how to get involved.

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes following our [commit message guidelines](./CONTRIBUTING.md#git-commit-guidelines)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## License

MIT License
