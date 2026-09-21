import { act, renderHook } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useChatStore } from '../../../entities/chat'
import { useSessionStore } from '../../../entities/session'
import { server } from '../../../test/msw/server'
import { useCreateChat } from './useCreateChat'

const credentials = {
  apiUrl: 'https://test.green-api.local',
  idInstance: '1234567890',
  apiTokenInstance: 'test-token',
}
const checkAccountUrl = `${credentials.apiUrl}/waInstance${credentials.idInstance}/checkAccount/${credentials.apiTokenInstance}`

beforeEach(() => {
  useSessionStore.getState().setCredentials(credentials)
})

afterEach(() => {
  useSessionStore.setState({ credentials: null })
  useChatStore.getState().reset()
  sessionStorage.clear()
})

async function create(phone: string) {
  const { result } = renderHook(() => useCreateChat())
  let created = false
  await act(async () => {
    created = await result.current.createChat(phone)
  })
  return { result, created }
}

describe('useCreateChat', () => {
  it('rejects an invalid phone number without a request', async () => {
    const { result, created } = await create('123')

    expect(created).toBe(false)
    expect(result.current.error).toContain('+7')
    expect(useChatStore.getState().chats).toEqual([])
  })

  it('creates a chat with the chatId from CheckAccount and selects it', async () => {
    server.use(
      http.post(checkAccountUrl, () =>
        HttpResponse.json({ exist: true, chatId: '10000000', fromCache: false }),
      ),
    )

    const { created } = await create('8 (999) 123-45-67')

    expect(created).toBe(true)
    expect(useChatStore.getState().chats).toEqual([
      { id: '10000000', phone: '79991234567', messages: [] },
    ])
    expect(useChatStore.getState().activeChatId).toBe('10000000')
  })

  it('shows an error when the number has no MAX account', async () => {
    server.use(
      http.post(checkAccountUrl, () =>
        HttpResponse.json({ exist: false, chatId: '', fromCache: false }),
      ),
    )

    const { result, created } = await create('+7 999 123-45-67')

    expect(created).toBe(false)
    expect(result.current.error).toBe('На этом номере нет аккаунта MAX')
    expect(useChatStore.getState().chats).toEqual([])
  })

  it('opens the existing chat instead of creating a duplicate', async () => {
    useChatStore.getState().addChat({ id: '10000000', phone: '79991234567' })

    const { created } = await create('+7 999 123-45-67')

    expect(created).toBe(true)
    expect(useChatStore.getState().chats).toHaveLength(1)
    expect(useChatStore.getState().activeChatId).toBe('10000000')
  })

  it('does not duplicate a chat when CheckAccount returns a known chatId', async () => {
    useChatStore.getState().addChat({ id: '10000000', phone: '79990000000' })
    server.use(
      http.post(checkAccountUrl, () =>
        HttpResponse.json({ exist: true, chatId: '10000000', fromCache: true }),
      ),
    )

    await create('+7 999 123-45-67')

    expect(useChatStore.getState().chats).toHaveLength(1)
    expect(useChatStore.getState().activeChatId).toBe('10000000')
  })

  it('shows the API error message on failure', async () => {
    server.use(http.post(checkAccountUrl, () => new HttpResponse(null, { status: 401 })))

    const { result, created } = await create('+7 999 123-45-67')

    expect(created).toBe(false)
    expect(result.current.error).toBe('Неверный apiTokenInstance')
  })
})
