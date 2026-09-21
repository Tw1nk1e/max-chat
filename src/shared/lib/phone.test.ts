import { describe, expect, it } from 'vitest'
import { formatPhone, normalizePhone } from './phone'

describe('normalizePhone', () => {
  it.each([
    ['+7 (999) 123-45-67', '79991234567'],
    ['89991234567', '79991234567'],
    ['79991234567', '79991234567'],
    ['+375 29 123-45-67', '375291234567'],
  ])('normalizes %s', (input, expected) => {
    expect(normalizePhone(input)).toBe(expected)
  })

  it.each(['', 'abc', '123', '+7 999 123-45', '+1 202 555 0100', '899912345678'])(
    'rejects %s',
    (input) => {
      expect(normalizePhone(input)).toBeNull()
    },
  )
})

describe('formatPhone', () => {
  it('formats Russian numbers', () => {
    expect(formatPhone('79991234567')).toBe('+7 999 123-45-67')
  })

  it('formats Belarusian numbers', () => {
    expect(formatPhone('375291234567')).toBe('+375 29 123-45-67')
  })
})
