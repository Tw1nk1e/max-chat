function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, '')
  const withRussianCode = /^8\d{10}$/.test(digits) ? `7${digits.slice(1)}` : digits

  if (/^7\d{10}$/.test(withRussianCode) || /^375\d{9}$/.test(withRussianCode)) {
    return withRussianCode
  }

  return null
}

function formatPhone(digits: string): string {
  if (/^7\d{10}$/.test(digits)) {
    return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`
  }

  if (/^375\d{9}$/.test(digits)) {
    return `+375 ${digits.slice(3, 5)} ${digits.slice(5, 8)}-${digits.slice(8, 10)}-${digits.slice(10)}`
  }

  return `+${digits}`
}

export { formatPhone, normalizePhone }
