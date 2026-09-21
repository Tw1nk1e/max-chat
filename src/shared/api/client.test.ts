import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '../../test/msw/server'
import {
  checkAccount,
  deleteNotification,
  getStateInstance,
  receiveNotification,
  sendMessage,
} from './client'
import { ApiError } from './errors'
import type { GreenApiCredentials } from './types'

const credentials: GreenApiCredentials = {
  apiUrl: 'https://test.green-api.local',
  idInstance: '1234567890',
  apiTokenInstance: 'test-token',
}

function methodUrl(method: string): string {
  return `${credentials.apiUrl}/waInstance${credentials.idInstance}/${method}/${credentials.apiTokenInstance}`
}

describe('getStateInstance', () => {
  it('returns the instance state', async () => {
    server.use(
      http.get(methodUrl('getStateInstance'), () =>
        HttpResponse.json({ stateInstance: 'authorized' }),
      ),
    )

    const result = await getStateInstance(credentials)

    expect(result).toEqual({ stateInstance: 'authorized' })
  })

  it('throws ApiError with a readable message on 401', async () => {
    server.use(
      http.get(methodUrl('getStateInstance'), () => new HttpResponse(null, { status: 401 })),
    )

    await expect(getStateInstance(credentials)).rejects.toMatchObject({
      status: 401,
      message: 'Неверный apiTokenInstance',
    })
    await expect(getStateInstance(credentials)).rejects.toBeInstanceOf(ApiError)
  })

  it('throws ApiError on a network failure', async () => {
    server.use(http.get(methodUrl('getStateInstance'), () => HttpResponse.error()))

    await expect(getStateInstance(credentials)).rejects.toMatchObject({
      status: 0,
      message: 'Нет соединения с сетью',
    })
  })
})

describe('sendMessage', () => {
  it('sends chatId and message and returns idMessage', async () => {
    let receivedBody: unknown

    server.use(
      http.post(methodUrl('sendMessage'), async ({ request }) => {
        receivedBody = await request.json()
        return HttpResponse.json({ idMessage: '1763115112345' })
      }),
    )

    const result = await sendMessage(credentials, '10000000', 'Привет!')

    expect(result).toEqual({ idMessage: '1763115112345' })
    expect(receivedBody).toEqual({ chatId: '10000000', message: 'Привет!' })
  })

  it('throws ApiError with a rate limit message on 429', async () => {
    server.use(http.post(methodUrl('sendMessage'), () => new HttpResponse(null, { status: 429 })))

    await expect(sendMessage(credentials, '10000000', 'Привет!')).rejects.toMatchObject({
      status: 429,
      message: 'Слишком много запросов, попробуйте позже',
    })
  })
})

describe('checkAccount', () => {
  it('sends the phone number and returns chatId', async () => {
    let receivedBody: unknown

    server.use(
      http.post(methodUrl('checkAccount'), async ({ request }) => {
        receivedBody = await request.json()
        return HttpResponse.json({ exist: true, chatId: '10000000', fromCache: false })
      }),
    )

    const result = await checkAccount(credentials, 79991234567)

    expect(result).toEqual({ exist: true, chatId: '10000000', fromCache: false })
    expect(receivedBody).toEqual({ phoneNumber: 79991234567 })
  })

  it('throws ApiError when the check limit is reached', async () => {
    server.use(
      http.post(methodUrl('checkAccount'), () =>
        HttpResponse.json({ status: false, reason: 'User get contact info limit reached' }),
      ),
    )

    await expect(checkAccount(credentials, 79991234567)).rejects.toMatchObject({
      message: 'Слишком много проверок номеров, попробуйте позже',
    })
  })

  it('maps HTTP 469 to a readable message', async () => {
    server.use(http.post(methodUrl('checkAccount'), () => new HttpResponse(null, { status: 469 })))

    await expect(checkAccount(credentials, 79991234567)).rejects.toMatchObject({
      status: 469,
      message: 'Слишком много проверок номеров, попробуйте позже',
    })
  })
})

describe('receiveNotification', () => {
  it('returns null when the queue is empty', async () => {
    server.use(
      http.get(methodUrl('receiveNotification'), () => new HttpResponse('', { status: 200 })),
    )

    const result = await receiveNotification(credentials)

    expect(result).toBeNull()
  })

  it('uses the default receiveTimeout of 5 seconds', async () => {
    let receivedUrl = ''

    server.use(
      http.get(methodUrl('receiveNotification'), ({ request }) => {
        receivedUrl = request.url
        return new HttpResponse('', { status: 200 })
      }),
    )

    await receiveNotification(credentials)

    expect(new URL(receivedUrl).searchParams.get('receiveTimeout')).toBe('5')
  })

  it('returns the parsed notification when one is available', async () => {
    const notification = {
      receiptId: 1234567,
      body: {
        typeWebhook: 'incomingMessageReceived',
        instanceData: { idInstance: 1234567890, wid: '79991234567@c.us', typeInstance: 'v3' },
        timestamp: 1763115112,
        idMessage: '1763115112345',
        senderData: {
          chatId: '10000000',
          chatName: 'Имя',
          chatType: 'user',
          sender: '10000000',
          senderName: 'Имя',
          senderType: 'user',
          senderContactName: 'Имя',
          senderPhoneNumber: 79876543210,
        },
        messageData: {
          typeMessage: 'textMessage',
          textMessageData: { textMessage: 'Привет!' },
        },
      },
    }

    server.use(http.get(methodUrl('receiveNotification'), () => HttpResponse.json(notification)))

    const result = await receiveNotification(credentials)

    expect(result).toEqual(notification)
  })
})

describe('deleteNotification', () => {
  it('sends the receiptId in the path and returns the result', async () => {
    server.use(
      http.delete(`${methodUrl('deleteNotification')}/1234567`, () =>
        HttpResponse.json({ result: true, reason: '' }),
      ),
    )

    const result = await deleteNotification(credentials, 1234567)

    expect(result).toEqual({ result: true, reason: '' })
  })
})
