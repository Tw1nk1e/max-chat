import { HttpResponse, delay, http } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { NotificationBody } from '../../../shared/api'
import { server } from '../../../test/msw/server'
import { backoffDelay, pollNotifications } from './pollNotifications'
import type { ConnectionStatus } from './pollNotifications'

const credentials = {
  apiUrl: 'https://test.green-api.local',
  idInstance: '1234567890',
  apiTokenInstance: 'test-token',
}
const base = `${credentials.apiUrl}/waInstance${credentials.idInstance}`
const receiveUrl = `${base}/receiveNotification/${credentials.apiTokenInstance}`
const deleteUrl = (receiptId: number) =>
  `${base}/deleteNotification/${credentials.apiTokenInstance}/${receiptId}`

const stateChanged: NotificationBody = { typeWebhook: 'stateInstanceChanged' }

function notification(receiptId: number) {
  return { receiptId, body: stateChanged }
}

function startPolling(options?: { onNotification?: (body: NotificationBody) => void }) {
  const controller = new AbortController()
  const statuses: ConnectionStatus[] = []
  const errors: (string | null)[] = []
  const received: NotificationBody[] = []

  const done = pollNotifications({
    credentials,
    signal: controller.signal,
    onConnectionChange: (status, error) => {
      statuses.push(status)
      errors.push(error)
    },
    onNotification: (body) => {
      received.push(body)
      options?.onNotification?.(body)
    },
  })

  return { controller, statuses, errors, received, done }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('backoffDelay', () => {
  it('doubles the delay and stops at 30 seconds', () => {
    expect([1, 2, 3, 4, 5, 6, 7, 10].map(backoffDelay)).toEqual([
      1000, 2000, 4000, 8000, 16000, 30000, 30000, 30000,
    ])
  })
})

describe('pollNotifications', () => {
  it('handles a notification, then deletes it by receiptId', async () => {
    const calls: string[] = []
    let receiveCount = 0

    server.use(
      http.get(receiveUrl, async () => {
        receiveCount += 1
        if (receiveCount === 1) {
          calls.push('receive')
          return HttpResponse.json(notification(11))
        }
        await delay('infinite')
        return new HttpResponse('')
      }),
      http.delete(deleteUrl(11), () => {
        calls.push('delete')
        return HttpResponse.json({ result: true, reason: '' })
      }),
    )

    const { controller, received, done } = startPolling({
      onNotification: () => calls.push('handle'),
    })

    await vi.waitFor(() => expect(receiveCount).toBe(2))
    controller.abort()
    await done

    expect(received).toEqual([stateChanged])
    expect(calls).toEqual(['receive', 'handle', 'delete'])
  })

  it('goes straight to the next request when the queue is empty', async () => {
    let receiveCount = 0

    server.use(
      http.get(receiveUrl, async () => {
        receiveCount += 1
        if (receiveCount < 3) {
          return new HttpResponse('')
        }
        await delay('infinite')
        return new HttpResponse('')
      }),
    )

    const { controller, received, done } = startPolling()

    await vi.waitFor(() => expect(receiveCount).toBe(3))
    controller.abort()
    await done

    expect(received).toEqual([])
  })

  it('deletes the notification even when handling it fails', async () => {
    const deleted: number[] = []
    let receiveCount = 0

    server.use(
      http.get(receiveUrl, async () => {
        receiveCount += 1
        if (receiveCount === 1) {
          return HttpResponse.json(notification(21))
        }
        await delay('infinite')
        return new HttpResponse('')
      }),
      http.delete(deleteUrl(21), () => {
        deleted.push(21)
        return HttpResponse.json({ result: true, reason: '' })
      }),
    )

    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const { controller, done } = startPolling({
      onNotification: () => {
        throw new Error('broken handler')
      },
    })

    await vi.advanceTimersByTimeAsync(1000)
    await vi.waitFor(() => expect(receiveCount).toBe(2))
    controller.abort()
    await done

    expect(deleted).toEqual([21])
  })

  it('reconnects with a growing pause and resets after a success', async () => {
    let receiveCount = 0

    server.use(
      http.get(receiveUrl, async () => {
        receiveCount += 1
        if (receiveCount <= 3) {
          return HttpResponse.error()
        }
        if (receiveCount === 4) {
          return new HttpResponse('')
        }
        if (receiveCount === 5) {
          return HttpResponse.error()
        }
        await delay('infinite')
        return new HttpResponse('')
      }),
    )

    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const { controller, statuses, done } = startPolling()

    await vi.advanceTimersByTimeAsync(0)
    expect(receiveCount).toBe(1)
    expect(statuses.at(-1)).toBe('reconnecting')

    await vi.advanceTimersByTimeAsync(999)
    expect(receiveCount).toBe(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(receiveCount).toBe(2)

    await vi.advanceTimersByTimeAsync(1999)
    expect(receiveCount).toBe(2)
    await vi.advanceTimersByTimeAsync(1)
    expect(receiveCount).toBe(3)

    await vi.advanceTimersByTimeAsync(4000)
    expect(receiveCount).toBe(5)
    expect(statuses.includes('online')).toBe(true)

    await vi.advanceTimersByTimeAsync(1000)
    expect(receiveCount).toBe(6)

    controller.abort()
    await done
  })

  it('explains a settings problem when the server answers 400', async () => {
    server.use(http.get(receiveUrl, () => new HttpResponse(null, { status: 400 })))
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })

    const { controller, statuses, errors, done } = startPolling()
    await vi.advanceTimersByTimeAsync(0)

    expect(statuses.at(-1)).toBe('reconnecting')
    expect(errors.at(-1)).toContain('webhookUrl')

    controller.abort()
    await done
  })

  it('shows the API message for rejected credentials and nothing for network errors', async () => {
    let receiveCount = 0
    server.use(
      http.get(receiveUrl, async () => {
        receiveCount += 1
        if (receiveCount === 1) {
          return new HttpResponse(null, { status: 401 })
        }
        if (receiveCount === 2) {
          return HttpResponse.error()
        }
        await delay('infinite')
        return new HttpResponse('')
      }),
    )
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })

    const { controller, errors, done } = startPolling()
    await vi.advanceTimersByTimeAsync(0)
    expect(errors).toEqual(['Неверный apiTokenInstance'])

    await vi.advanceTimersByTimeAsync(1000)
    expect(errors).toEqual(['Неверный apiTokenInstance', null])

    controller.abort()
    await done
  })

  it('stops without further requests after abort', async () => {
    let receiveCount = 0

    server.use(
      http.get(receiveUrl, async () => {
        receiveCount += 1
        await delay('infinite')
        return new HttpResponse('')
      }),
    )

    const { controller, done } = startPolling()
    await vi.waitFor(() => expect(receiveCount).toBe(1))

    controller.abort()
    await done

    expect(receiveCount).toBe(1)
  })
})
