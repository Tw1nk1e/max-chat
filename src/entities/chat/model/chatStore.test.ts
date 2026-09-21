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

  it('confirms a pending message with the server idMessage', () => {
    useChatStore.getState().addChat({ id: '1', phone: '79991234567' })
    useChatStore.getState().addMessage('1', message)
    useChatStore.getState().confirmMessage('1', 'local-1', 'srv-1')

    expect(useChatStore.getState().chats[0].messages).toEqual([
      { ...message, idMessage: 'srv-1', status: 'sent' },
    ])
  })

  it('keeps a single message when the echo with the same idMessage already arrived', () => {
    useChatStore.getState().addChat({ id: '1', phone: '79991234567' })
    useChatStore.getState().addMessage('1', message)
    useChatStore.getState().receiveMessage({
      chat: { id: '1', phone: '79991234567' },
      message: { ...message, id: 'echo-1', idMessage: 'srv-1', status: 'sent' },
    })
    useChatStore.getState().confirmMessage('1', 'local-1', 'srv-1')

    expect(useChatStore.getState().chats[0].messages.map((item) => item.id)).toEqual(['echo-1'])
  })

  it('creates a chat for an incoming message from an unknown chat', () => {
    useChatStore.getState().receiveMessage({
      chat: { id: '10000000', phone: '79991234567', name: 'Иван' },
      message: { ...message, direction: 'in', status: 'sent', idMessage: 'in-1' },
    })

    const [chat] = useChatStore.getState().chats
    expect(chat).toMatchObject({ id: '10000000', phone: '79991234567', name: 'Иван' })
    expect(chat.messages).toHaveLength(1)
  })

  it('ignores an incoming message with a known idMessage', () => {
    const incoming = {
      chat: { id: '1', phone: '79991234567' },
      message: { ...message, direction: 'in' as const, status: 'sent' as const, idMessage: 'in-1' },
    }
    useChatStore.getState().receiveMessage(incoming)
    useChatStore.getState().receiveMessage(incoming)

    expect(useChatStore.getState().chats[0].messages).toHaveLength(1)
  })

  it('appends incoming messages to an existing chat', () => {
    useChatStore.getState().addChat({ id: '1', phone: '79991234567' })
    useChatStore.getState().receiveMessage({
      chat: { id: '1', phone: '79991234567' },
      message: { ...message, direction: 'in', status: 'sent', idMessage: 'in-1' },
    })

    expect(useChatStore.getState().chats).toHaveLength(1)
    expect(useChatStore.getState().chats[0].messages).toHaveLength(1)
  })

  it('resets everything', () => {
    useChatStore.getState().addChat({ id: '1', phone: '79991234567' })
    useChatStore.getState().selectChat('1')
    useChatStore.getState().reset()

    expect(useChatStore.getState().chats).toEqual([])
    expect(useChatStore.getState().activeChatId).toBeNull()
  })
})
