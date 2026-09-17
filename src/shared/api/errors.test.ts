import { describe, expect, it } from 'vitest'
import { ApiError, createApiError, createNetworkError } from './errors'

describe('createApiError', () => {
  it.each([
    [401, 'Неверный apiTokenInstance'],
    [403, 'Неверный idInstance или адрес apiUrl'],
    [429, 'Слишком много запросов, попробуйте позже'],
    [400, 'Некорректный запрос к GREEN-API'],
    [500, 'GREEN-API временно недоступен, попробуйте позже'],
    [418, 'Не удалось выполнить запрос к GREEN-API'],
  ])('maps status %i to a readable message', (status, message) => {
    const error = createApiError(status)

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(status)
    expect(error.message).toBe(message)
  })
})

describe('createNetworkError', () => {
  it('returns a status-0 ApiError', () => {
    const error = createNetworkError()

    expect(error.status).toBe(0)
    expect(error.message).toBe('Нет соединения с сетью')
  })
})
