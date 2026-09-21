import { describe, expect, it } from 'vitest'
import { formatTime } from './time'

describe('formatTime', () => {
  it('formats a timestamp as hours and minutes', () => {
    const timestamp = new Date(2026, 0, 5, 9, 7).getTime()

    expect(formatTime(timestamp)).toBe('09:07')
  })
})
