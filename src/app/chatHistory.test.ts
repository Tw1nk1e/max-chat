import { afterEach, describe, expect, it } from 'vitest'
import { closeChatHistory, useChatStore } from '../entities/chat'
import { useSessionStore } from '../entities/session'
import { syncChatHistoryWithSession } from './chatHistory'

const credentials = {
  apiUrl: 'https://test.green-api.local',
  idInstance: '111',
  apiTokenInstance: 'test-token',
}

const storedHistory = JSON.stringify({
  state: { chats: [{ id: '1', phone: '79991234567', messages: [] }] },
  version: 1,
})

afterEach(() => {
  useSessionStore.setState({ credentials: null })
  closeChatHistory()
  localStorage.clear()
  sessionStorage.clear()
})

describe('syncChatHistoryWithSession', () => {
  it('loads the history of an already restored session', () => {
    localStorage.setItem('max-chat-history:111', storedHistory)
    useSessionStore.setState({ credentials })

    const unsubscribe = syncChatHistoryWithSession()

    expect(useChatStore.getState().chats).toHaveLength(1)
    unsubscribe()
  })

  it('loads the history right after a login', () => {
    localStorage.setItem('max-chat-history:111', storedHistory)
    const unsubscribe = syncChatHistoryWithSession()

    expect(useChatStore.getState().chats).toEqual([])
    useSessionStore.getState().setCredentials(credentials)

    expect(useChatStore.getState().chats).toHaveLength(1)
    unsubscribe()
  })
})
