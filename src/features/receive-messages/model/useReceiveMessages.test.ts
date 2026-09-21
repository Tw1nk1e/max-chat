import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, delay, http } from 'msw'
import { afterEach, describe, expect, it } from 'vitest'
import { useChatStore } from '../../../entities/chat'
import { useSessionStore } from '../../../entities/session'
import { server } from '../../../test/msw/server'
import { useReceiveMessages } from './useReceiveMessages'

const credentials = {
  apiUrl: 'https://test.green-api.local',
  idInstance: '1234567890',
  apiTokenInstance: 'test-token',
}
const base = `${credentials.apiUrl}/waInstance${credentials.idInstance}`
const receiveUrl = `${base}/receiveNotification/${credentials.apiTokenInstance}`

const incomingNotification = {
  receiptId: 5,
  body: {
    typeWebhook: 'incomingMessageReceived',
    instanceData: { idInstance: 1234567890, wid: '79990000000@c.us', typeInstance: 'v3' },
    timestamp: 1763115112,
    idMessage: 'in-1',
    senderData: {
      chatId: '10000000',
      chatName: 'Иван',
      chatType: 'user',
      sender: '10000000',
      senderName: 'Иван',
      senderType: 'user',
      senderContactName: 'Иван',
      senderPhoneNumber: 79991234567,
    },
    messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: 'Привет!' } },
  },
}

afterEach(() => {
  useSessionStore.setState({ credentials: null })
  useChatStore.getState().reset()
  sessionStorage.clear()
})

describe('useReceiveMessages', () => {
  it('does not poll without a session', async () => {
    let receiveCount = 0
    server.use(
      http.get(receiveUrl, () => {
        receiveCount += 1
        return new HttpResponse('')
      }),
    )

    renderHook(() => useReceiveMessages())
    await delay(50)

    expect(receiveCount).toBe(0)
  })

  it('stores incoming messages and stops polling on unmount', async () => {
    let receiveCount = 0
    useSessionStore.getState().setCredentials(credentials)
    server.use(
      http.get(receiveUrl, async () => {
        receiveCount += 1
        if (receiveCount === 1) {
          return HttpResponse.json(incomingNotification)
        }
        await delay('infinite')
        return new HttpResponse('')
      }),
      http.delete(`${base}/deleteNotification/${credentials.apiTokenInstance}/5`, () =>
        HttpResponse.json({ result: true, reason: '' }),
      ),
    )

    const { result, unmount } = renderHook(() => useReceiveMessages())

    await waitFor(() => expect(useChatStore.getState().chats).toHaveLength(1))
    expect(useChatStore.getState().chats[0].messages[0].text).toBe('Привет!')
    expect(result.current).toBe('online')

    await waitFor(() => expect(receiveCount).toBe(2))
    unmount()
    await delay(50)

    expect(receiveCount).toBe(2)
  })

  it('reports reconnecting when the request fails', async () => {
    useSessionStore.getState().setCredentials(credentials)
    server.use(http.get(receiveUrl, () => HttpResponse.error()))

    const { result } = renderHook(() => useReceiveMessages())

    await waitFor(() => expect(result.current).toBe('reconnecting'))
  })
})
