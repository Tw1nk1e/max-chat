import { describe, expect, it } from 'vitest'
import { getChatTitle } from './chatTitle'

describe('getChatTitle', () => {
  it('formats the phone number when it is known', () => {
    expect(getChatTitle({ id: '1', phone: '79991234567', messages: [] })).toBe('+7 999 123-45-67')
  })

  it('falls back to the chat name when the phone is hidden', () => {
    expect(getChatTitle({ id: '1', phone: '', name: 'Иван', messages: [] })).toBe('Иван')
  })

  it('falls back to the chat id when there is nothing else', () => {
    expect(getChatTitle({ id: '10000000', phone: '', messages: [] })).toBe('10000000')
  })
})
