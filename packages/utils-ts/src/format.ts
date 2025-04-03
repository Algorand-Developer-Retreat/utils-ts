export type FormatOptions = {
  style?: 'currency' | 'decimal'
  compact?: boolean | 'auto'
  fractionDigits?: number
  adaptiveDecimals?: boolean
}

const DEFAULT_COMPACT_THRESHOLD = 100_000n

/**
 * Custom number formatting implementation that handles both regular and compact notation.
 *
 * We use a custom implementation for compact notation (K, M, B, T) because React Native's
 * JavaScript engine (Hermes) has incomplete Intl support. Specifically, the
 * `notation: "compact"` option is not supported on either iOS or Android.
 *
 * @see https://github.com/facebook/hermes/issues/1035
 *
 * Once Hermes adds full Intl support, this implementation can be simplified to use
 * the native compact notation:
 * ```
 * new Intl.NumberFormat('en-US', {
 *   notation: 'compact',
 *   compactDisplay: 'short'
 * })
 * ```
 */
export const formatNumber = (
  amount: string | number | bigint,
  options: FormatOptions = {},
): string => {
  const {
    style = 'decimal',
    compact = false,
    fractionDigits,
    adaptiveDecimals = false,
  } = options

  const value = typeof amount === 'string' ? Number(amount) : amount
  const absValue =
    typeof value === 'bigint' ? (value < 0n ? -value : value) : Math.abs(value)
  const shouldUseCompact =
    compact === 'auto' ? absValue >= DEFAULT_COMPACT_THRESHOLD : compact

  // For non-zero values that would display as 0 with the specified `fractionDigits`,
  // use `roundToFirstNonZeroDecimal` if `adaptiveDecimals` is enabled
  const numValue = typeof value === 'bigint' ? Number(value) : value
  const useRounding =
    adaptiveDecimals &&
    numValue !== 0 &&
    Math.abs(numValue) < Math.pow(10, -(fractionDigits ?? 2))

  // Create base formatter for non-compact numbers
  const baseFormatter = new Intl.NumberFormat('en-US', {
    style,
    ...(style === 'currency' && { currency: 'USD' }),
    maximumFractionDigits: useRounding ? 20 : (fractionDigits ?? 2),
    minimumFractionDigits: useRounding ? 0 : (fractionDigits ?? 2),
  })

  if (!shouldUseCompact) {
    if (useRounding) {
      return baseFormatter.format(roundToFirstNonZeroDecimal(numValue))
    }
    return baseFormatter.format(value)
  }

  // Custom compact notation implementation
  const tiers = [
    { threshold: 1e12, suffix: 'T', divisor: 1e12 },
    { threshold: 1e9, suffix: 'B', divisor: 1e9 },
    { threshold: 1e6, suffix: 'M', divisor: 1e6 },
    { threshold: 1e3, suffix: 'K', divisor: 1e3 },
  ]

  const tier = tiers.find((t) => absValue >= t.threshold)
  if (tier) {
    // Create compact formatter with different fraction digits
    const compactFormatter = new Intl.NumberFormat('en-US', {
      style,
      ...(style === 'currency' && { currency: 'USD' }),
      maximumFractionDigits: fractionDigits ?? 1,
      minimumFractionDigits: fractionDigits ?? 1,
    })
    const scaled = Number(value) / tier.divisor
    const formatted = compactFormatter.format(scaled)
    return formatted + tier.suffix
  }

  // Fallback for small numbers uses the base formatter
  if (useRounding) {
    return baseFormatter.format(roundToFirstNonZeroDecimal(numValue))
  }
  return baseFormatter.format(value)
}

/**
 * Round a number to the first non-zero decimal place
 * @param {number} num - The number to round
 * @returns {number} The rounded number
 * @example
 * roundToFirstNonZeroDecimal(0.001234) // 0.001
 * roundToFirstNonZeroDecimal(0.0005678) // 0.0006
 * roundToFirstNonZeroDecimal(1234.567) // 1234.567
 */
export function roundToFirstNonZeroDecimal(num: number): number {
  if (num === 0) return 0

  // Convert the number to exponential format to find the exponent
  const expForm = num.toExponential().split('e')
  const exponent = parseInt(expForm[1])

  // Calculate the number of decimal places needed
  const decimalPlaces = Math.abs(exponent)

  // Use toFixed to round to the first significant decimal place
  return Number(num.toFixed(decimalPlaces))
}

/**
 * Formats an Algorand address to show first 5 and last 5 characters
 * @param address - The full Algorand address
 * @param prefixLength - Number of characters to show at start (default: 5)
 * @param suffixLength - Number of characters to show at end (default: 5)
 * @returns Formatted address string or empty string if address is falsy
 */
export function formatShortAddress(
  address?: string | null,
  prefixLength = 5,
  suffixLength = 5,
): string {
  if (!address) return ''
  if (address.length <= prefixLength + suffixLength) return address

  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`
}
