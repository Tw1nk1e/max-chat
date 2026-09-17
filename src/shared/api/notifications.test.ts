import { describe, expect, it } from 'vitest'
import { isMessageNotification, isTextMessage } from './notifications'
import type { MessageNotificationBody, NotificationBody } from './types'

const textMessageNotification: MessageNotificationBody = {
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
}

describe('isMessageNotification', () => {
  it('accepts incoming, outgoing and outgoing API message notifications', () => {
    const types: NotificationBody['typeWebhook'][] = [
      'incomingMessageReceived',
      'outgoingMessageReceived',
      'outgoingAPIMessageReceived',
    ]

    for (const typeWebhook of types) {
      expect(isMessageNotification({ ...textMessageNotification, typeWebhook })).toBe(true)
    }
  })

  it('rejects service notifications', () => {
    const stateChanged: NotificationBody = { typeWebhook: 'stateInstanceChanged' }

    expect(isMessageNotification(stateChanged)).toBe(false)
  })
})

describe('isTextMessage', () => {
  it('accepts textMessage payloads', () => {
    expect(isTextMessage(textMessageNotification)).toBe(true)
  })

  it('rejects other message types', () => {
    const imageMessage: MessageNotificationBody = {
      ...textMessageNotification,
      messageData: { typeMessage: 'imageMessage' },
    }

    expect(isTextMessage(imageMessage)).toBe(false)
  })
})
