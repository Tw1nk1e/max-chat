import { deleteNotification, receiveNotification } from '../../../shared/api'
import type { GreenApiCredentials, NotificationBody } from '../../../shared/api'

type ConnectionStatus = 'online' | 'reconnecting'

type PollOptions = {
  credentials: GreenApiCredentials
  signal: AbortSignal
  onConnectionChange: (status: ConnectionStatus) => void
  onNotification: (body: NotificationBody) => void
}

const RECEIVE_TIMEOUT_SECONDS = 20
const BASE_DELAY_MS = 1000
const MAX_DELAY_MS = 30000

function backoffDelay(failures: number): number {
  return Math.min(BASE_DELAY_MS * 2 ** (failures - 1), MAX_DELAY_MS)
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms)
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        resolve()
      },
      { once: true },
    )
  })
}

async function pollNotifications({
  credentials,
  signal,
  onConnectionChange,
  onNotification,
}: PollOptions): Promise<void> {
  let failures = 0

  while (!signal.aborted) {
    try {
      const notification = await receiveNotification(credentials, {
        receiveTimeout: RECEIVE_TIMEOUT_SECONDS,
        signal,
      })

      failures = 0
      onConnectionChange('online')

      if (!notification) {
        continue
      }

      try {
        onNotification(notification.body)
      } finally {
        await deleteNotification(credentials, notification.receiptId)
      }
    } catch {
      if (signal.aborted) {
        return
      }

      failures += 1
      onConnectionChange('reconnecting')
      await sleep(backoffDelay(failures), signal)
    }
  }
}

export { backoffDelay, pollNotifications }
export type { ConnectionStatus }
