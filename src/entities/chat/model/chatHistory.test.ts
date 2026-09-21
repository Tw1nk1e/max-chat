import { afterEach, describe, expect, it, vi } from 'vitest'
import { closeChatHistory, openChatHistory, useChatStore } from './chatStore'
import type { ChatMessage } from './types'

const message: ChatMessage = {
  id: 'local-1',
  idMessage: 'srv-1',
  text: 'Привет',
  timestamp: 1763115112000,
  direction: 'out',
  status: 'sent',
}

const keyFor = (idInstance: string) => `max-chat-history:${idInstance}`

function storedChats(idInstance: string) {
  const raw = localStorage.getItem(keyFor(idInstance))
  return raw ? (JSON.parse(raw).state.chats as unknown[]) : null
}

afterEach(() => {
  closeChatHistory()
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('chat history', () => {
  it('does not write anything while no session is open', () => {
    useChatStore.getState().addChat({ id: '1', phone: '79991234567' })

    expect(localStorage.length).toBe(0)
  })

  it('saves chats under a key bound to idInstance', () => {
    openChatHistory('111')
    useChatStore.getState().addChat({ id: '1', phone: '79991234567' })
    useChatStore.getState().addMessage('1', message)

    expect(storedChats('111')).toEqual([{ id: '1', phone: '79991234567', messages: [message] }])
    expect(storedChats('222')).toBeNull()
  })

  it('restores the history when the same instance signs in again', () => {
    openChatHistory('111')
    useChatStore.getState().addChat({ id: '1', phone: '79991234567' })
    useChatStore.getState().addMessage('1', message)
    closeChatHistory()

    expect(useChatStore.getState().chats).toEqual([])
    expect(storedChats('111')).toHaveLength(1)

    openChatHistory('111')

    expect(useChatStore.getState().chats[0].messages).toEqual([message])
  })

  it('keeps histories of different instances separate', () => {
    openChatHistory('111')
    useChatStore.getState().addChat({ id: '1', phone: '79991234567' })
    closeChatHistory()

    openChatHistory('222')

    expect(useChatStore.getState().chats).toEqual([])
    expect(storedChats('111')).toHaveLength(1)
  })

  it('turns messages that were still pending into failed ones', () => {
    localStorage.setItem(
      keyFor('111'),
      JSON.stringify({
        state: {
          chats: [{ id: '1', phone: '79991234567', messages: [{ ...message, status: 'pending' }] }],
        },
        version: 1,
      }),
    )

    openChatHistory('111')

    expect(useChatStore.getState().chats[0].messages[0].status).toBe('error')
  })

  it('ignores broken stored data', () => {
    localStorage.setItem(keyFor('111'), 'not json')

    openChatHistory('111')

    expect(useChatStore.getState().chats).toEqual([])
  })

  it('does not persist the selected chat', () => {
    openChatHistory('111')
    useChatStore.getState().addChat({ id: '1', phone: '79991234567' })
    useChatStore.getState().selectChat('1')

    expect(localStorage.getItem(keyFor('111'))).not.toContain('activeChatId')
  })

  it('keeps working when the storage is full', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    openChatHistory('111')

    expect(() => useChatStore.getState().addChat({ id: '1', phone: '79991234567' })).not.toThrow()
    expect(useChatStore.getState().chats).toHaveLength(1)
  })
})
