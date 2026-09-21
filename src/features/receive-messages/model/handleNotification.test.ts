import { afterEach, describe, expect, it } from 'vitest'
import { useChatStore } from '../../../entities/chat'
import type { MessageNotificationBody, NotificationBody } from '../../../shared/api'
import { handleNotification } from './handleNotification'

const incoming: MessageNotificationBody = {
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
}

afterEach(() => {
  useChatStore.getState().reset()
})

describe('handleNotification', () => {
  it('creates a chat and stores an incoming text message', () => {
    handleNotification(incoming)

    const [chat] = useChatStore.getState().chats
    expect(chat).toMatchObject({ id: '10000000', phone: '79991234567', name: 'Иван' })
    expect(chat.messages[0]).toMatchObject({
      idMessage: 'in-1',
      text: 'Привет!',
      timestamp: 1763115112000,
      direction: 'in',
      status: 'sent',
    })
  })

  it('adds the message to an existing chat instead of creating a new one', () => {
    useChatStore.getState().addChat({ id: '10000000', phone: '79991234567' })

    handleNotification(incoming)

    expect(useChatStore.getState().chats).toHaveLength(1)
    expect(useChatStore.getState().chats[0].messages).toHaveLength(1)
  })

  it('ignores a repeated notification with the same idMessage', () => {
    handleNotification(incoming)
    handleNotification(incoming)

    expect(useChatStore.getState().chats[0].messages).toHaveLength(1)
  })

  it.each(['outgoingMessageReceived', 'outgoingAPIMessageReceived'] as const)(
    'stores %s as an outgoing message',
    (typeWebhook) => {
      handleNotification({ ...incoming, typeWebhook })

      expect(useChatStore.getState().chats[0].messages[0].direction).toBe('out')
    },
  )

  it('keeps the phone empty when the number is hidden', () => {
    handleNotification({
      ...incoming,
      senderData: { ...incoming.senderData, senderPhoneNumber: 0 },
    })

    expect(useChatStore.getState().chats[0].phone).toBe('')
  })

  it('ignores group chats', () => {
    handleNotification({
      ...incoming,
      senderData: { ...incoming.senderData, chatId: '-1000', chatType: 'group' },
    })

    expect(useChatStore.getState().chats).toEqual([])
  })

  it('ignores messages that are not text', () => {
    handleNotification({ ...incoming, messageData: { typeMessage: 'imageMessage' } })

    expect(useChatStore.getState().chats).toEqual([])
  })

  it('ignores service notifications', () => {
    const stateChanged: NotificationBody = { typeWebhook: 'stateInstanceChanged' }

    handleNotification(stateChanged)

    expect(useChatStore.getState().chats).toEqual([])
  })
})
