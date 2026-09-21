import { useChatStore } from '../../../entities/chat'
import { isMessageNotification, isTextMessage } from '../../../shared/api'
import type { NotificationBody } from '../../../shared/api'

function handleNotification(body: NotificationBody): void {
  if (!isMessageNotification(body) || !isTextMessage(body)) {
    return
  }

  const { senderData, messageData, idMessage, timestamp, typeWebhook } = body
  if (senderData.chatType !== 'user') {
    return
  }

  useChatStore.getState().receiveMessage({
    chat: {
      id: senderData.chatId,
      phone: senderData.senderPhoneNumber ? String(senderData.senderPhoneNumber) : '',
      name: senderData.chatName,
    },
    message: {
      id: crypto.randomUUID(),
      idMessage,
      text: messageData.textMessageData.textMessage,
      timestamp: timestamp * 1000,
      direction: typeWebhook === 'incomingMessageReceived' ? 'in' : 'out',
      status: 'sent',
    },
  })
}

export { handleNotification }
