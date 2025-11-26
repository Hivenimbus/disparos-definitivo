export type ContactVariableInput = string | number | null | undefined

const numericPattern = /^-?\d+(?:[.,]\d+)?$/

const formatRoundedNumber = (value: number): string => {
  const rounded = Math.round(value * 100) / 100
  const fixed = rounded.toFixed(2)
  const trimmed = fixed
    .replace(/(\.\d*?[1-9])0+$/, '$1')
    .replace(/\.00$/, '')
    .replace(/\.$/, '')

  return trimmed || '0'
}

const tryParseDecimal = (raw: string): number | null => {
  const trimmed = raw.trim()
  if (!trimmed || !numericPattern.test(trimmed)) {
    return null
  }

  const normalized = trimmed.replace(',', '.')
  const parsed = Number(normalized)

  return Number.isFinite(parsed) ? parsed : null
}

export const normalizeContactVariable = (value: ContactVariableInput): string => {
  if (value === null || value === undefined) {
    return ''
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return formatRoundedNumber(value)
  }

  const stringValue = String(value).trim()
  if (!stringValue) {
    return ''
  }

  const parsed = tryParseDecimal(stringValue)
  if (parsed === null) {
    return stringValue
  }

  return formatRoundedNumber(parsed)
}

export const normalizeContactVariableOrNull = (
  value: ContactVariableInput
): string | null => {
  const normalized = normalizeContactVariable(value)
  return normalized === '' ? null : normalized
}







