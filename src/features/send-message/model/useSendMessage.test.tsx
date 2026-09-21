import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useChatStore } from '../../../entities/chat'
import { useSessionStore } from '../../../entities/session'
import { server } from '../../../test/msw/server'
import { createQueryWrapper } from '../../../test/queryWrapper'
import { useSendMessage } from './useSendMessage'

const credentials = {
  apiUrl: 'https://test.green-api.local',
  idInstance: '1234567890',
  apiTokenInstance: 'test-token',
}
const sendMessageUrl = `${credentials.apiUrl}/waInstance${credentials.idInstance}/sendMessage/${credentials.apiTokenInstance}`

function messages() {
  return useChatStore.getState().chats[0].messages
}

beforeEach(() => {
  useSessionStore.getState().setCredentials(credentials)
  useChatStore.getState().addChat({ id: '10000000', phone: '79991234567' })
})

afterEach(() => {
  useSessionStore.setState({ credentials: null })
  useChatStore.getState().reset()
  sessionStorage.clear()
})

describe('useSendMessage', () => {
  it('adds a pending message and marks it sent with the server idMessage', async () => {
    server.use(http.post(sendMessageUrl, () => HttpResponse.json({ idMessage: 'srv-1' })))
    const { result } = renderHook(() => useSendMessage(), { wrapper: createQueryWrapper() })

    act(() => {
      result.current.send('10000000', '  Привет  ')
    })

    expect(messages()[0]).toMatchObject({ text: 'Привет', direction: 'out', status: 'pending' })
    await waitFor(() => expect(messages()[0]).toMatchObject({ status: 'sent', idMessage: 'srv-1' }))
  })

  it('ignores empty messages', () => {
    const { result } = renderHook(() => useSendMessage(), { wrapper: createQueryWrapper() })

    let sent = true
    act(() => {
      sent = result.current.send('10000000', '   ')
    })

    expect(sent).toBe(false)
    expect(messages()).toEqual([])
  })

  it('marks the message as failed and allows a retry', async () => {
    server.use(http.post(sendMessageUrl, () => new HttpResponse(null, { status: 429 })))
    const { result } = renderHook(() => useSendMessage(), { wrapper: createQueryWrapper() })

    act(() => {
      result.current.send('10000000', 'Привет')
    })
    await waitFor(() => expect(messages()[0].status).toBe('error'))

    server.use(http.post(sendMessageUrl, () => HttpResponse.json({ idMessage: 'srv-2' })))
    act(() => {
      result.current.retry('10000000', messages()[0].id)
    })

    expect(messages()[0].status).toBe('pending')
    await waitFor(() => expect(messages()[0]).toMatchObject({ status: 'sent', idMessage: 'srv-2' }))
    expect(messages()).toHaveLength(1)
  })

  it('does not retry a message that is not in the error state', () => {
    const { result } = renderHook(() => useSendMessage(), { wrapper: createQueryWrapper() })
    useChatStore.getState().addMessage('10000000', {
      id: 'm1',
      idMessage: 'srv-1',
      text: 'Привет',
      timestamp: 1,
      direction: 'out',
      status: 'sent',
    })

    act(() => {
      result.current.retry('10000000', 'm1')
    })

    expect(messages()[0].status).toBe('sent')
  })
})
