import { describe, expect, it } from 'vitest'
import { stateInstanceMessage } from './stateInstanceMessage'

describe('stateInstanceMessage', () => {
  it.each([
    ['notAuthorized', 'не авторизован'],
    ['blocked', 'заблокирован'],
    ['starting', 'запускается'],
    ['suspended', 'ограничения'],
    ['pendingPassword', 'пароль'],
  ] as const)('returns a readable message for %s', (state, expectedSubstring) => {
    expect(stateInstanceMessage(state)).toContain(expectedSubstring)
  })
})
