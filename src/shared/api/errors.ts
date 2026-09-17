class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function messageForStatus(status: number): string {
  switch (status) {
    case 401:
      return 'Неверный apiTokenInstance'
    case 403:
      return 'Неверный idInstance или адрес apiUrl'
    case 429:
      return 'Слишком много запросов, попробуйте позже'
    case 400:
      return 'Некорректный запрос к GREEN-API'
    case 500:
    case 502:
      return 'GREEN-API временно недоступен, попробуйте позже'
    default:
      return 'Не удалось выполнить запрос к GREEN-API'
  }
}

function createApiError(status: number): ApiError {
  return new ApiError(status, messageForStatus(status))
}

function createNetworkError(): ApiError {
  return new ApiError(0, 'Нет соединения с сетью')
}

export { ApiError, createApiError, createNetworkError }
