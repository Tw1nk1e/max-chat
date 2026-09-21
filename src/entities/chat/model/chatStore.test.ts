import { afterEach, describe, expect, it } from 'vitest'
import { useChatStore } from './chatStore'
import type { ChatMessage } from './types'

const message: ChatMessage = {
  id: 'local-1',
  idMessage: null,
  text: 'Привет',
  timestamp: 1763115112000,
  direction: 'out',
  status: 'pending',
}

afterEach(() => {
  useChatStore.getState().reset()
})

describe('useChatStore', () => {
  it('adds new chats to the top of the list', () => {
    useChatStore.getState().addChat({ id: '1', phone: '79991234567' })
    useChatStore.getState().addChat({ id: '2', phone: '79990000000' })

    expect(useChatStore.getState().chats.map((chat) => chat.id)).toEqual(['2', '1'])
  })

  it('selects a chat', () => {
    useChatStore.getState().selectChat('1')

    expect(useChatStore.getState().activeChatId).toBe('1')
  })

  it('adds a message only to the requested chat', () => {
    useChatStore.getState().addChat({ id: '1', phone: '79991234567' })
    useChatStore.getState().addChat({ id: '2', phone: '79990000000' })
    useChatStore.getState().addMessage('1', message)

    const [second, first] = useChatStore.getState().chats
    expect(first.messages).toEqual([message])
    expect(second.messages).toEqual([])
  })

  it('updates a message by id', () => {
    useChatStore.getState().addChat({ id: '1', phone: '79991234567' })
    useChatStore.getState().addMessage('1', message)
    useChatStore.getState().updateMessage('1', 'local-1', { status: 'sent', idMessage: 'srv-1' })

    expect(useChatStore.getState().chats[0].messages[0]).toMatchObject({
      status: 'sent',
      idMessage: 'srv-1',
    })
  })

  it('resets everything', () => {
    useChatStore.getState().addChat({ id: '1', phone: '79991234567' })
    useChatStore.getState().selectChat('1')
    useChatStore.getState().reset()

    expect(useChatStore.getState().chats).toEqual([])
    expect(useChatStore.getState().activeChatId).toBeNull()
  })
})
