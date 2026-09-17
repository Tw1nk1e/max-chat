import type { MessageNotificationBody, NotificationBody, TextMessagePayload } from './types'

function isMessageNotification(body: NotificationBody): body is MessageNotificationBody {
  return (
    body.typeWebhook === 'incomingMessageReceived' ||
    body.typeWebhook === 'outgoingMessageReceived' ||
    body.typeWebhook === 'outgoingAPIMessageReceived'
  )
}

function isTextMessage(
  body: MessageNotificationBody,
): body is MessageNotificationBody & { messageData: TextMessagePayload } {
  return body.messageData.typeMessage === 'textMessage'
}

export { isMessageNotification, isTextMessage }
