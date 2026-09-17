import { createApiError, createNetworkError } from './errors'
import type {
  DeleteNotificationResult,
  GetStateInstanceResult,
  GreenApiCredentials,
  ReceivedNotification,
  SendMessageResult,
} from './types'

function buildUrl(credentials: GreenApiCredentials, method: string): string {
  const apiUrl = credentials.apiUrl.replace(/\/$/, '')
  return `${apiUrl}/waInstance${credentials.idInstance}/${method}/${credentials.apiTokenInstance}`
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response

  try {
    response = await fetch(url, init)
  } catch {
    throw createNetworkError()
  }

  if (!response.ok) {
    throw createApiError(response.status)
  }

  const text = await response.text()
  if (!text) {
    return null as T
  }

  return JSON.parse(text) as T
}

async function getStateInstance(credentials: GreenApiCredentials): Promise<GetStateInstanceResult> {
  return request<GetStateInstanceResult>(buildUrl(credentials, 'getStateInstance'))
}

async function sendMessage(
  credentials: GreenApiCredentials,
  chatId: string,
  message: string,
): Promise<SendMessageResult> {
  return request<SendMessageResult>(buildUrl(credentials, 'sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  })
}

async function receiveNotification(
  credentials: GreenApiCredentials,
  options?: { receiveTimeout?: number; signal?: AbortSignal },
): Promise<ReceivedNotification | null> {
  const receiveTimeout = options?.receiveTimeout ?? 5
  const url = `${buildUrl(credentials, 'receiveNotification')}?receiveTimeout=${receiveTimeout}`

  return request<ReceivedNotification | null>(url, { signal: options?.signal })
}

async function deleteNotification(
  credentials: GreenApiCredentials,
  receiptId: number,
): Promise<DeleteNotificationResult> {
  const url = `${buildUrl(credentials, 'deleteNotification')}/${receiptId}`

  return request<DeleteNotificationResult>(url, { method: 'DELETE' })
}

export { getStateInstance, sendMessage, receiveNotification, deleteNotification }
