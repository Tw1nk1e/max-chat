import { describe, expect, it } from 'vitest'
import { formatTime } from './time'

describe('formatTime', () => {
  const timestamp = new Date(2026, 0, 5, 9, 7).getTime()

  it('shows only hours and minutes for today', () => {
    const now = new Date(2026, 0, 5, 18, 30).getTime()

    expect(formatTime(timestamp, now)).toBe('09:07')
  })

  it('adds the date for earlier days', () => {
    const now = new Date(2026, 0, 6, 10, 0).getTime()

    expect(formatTime(timestamp, now)).toBe('05.01 09:07')
  })
})
