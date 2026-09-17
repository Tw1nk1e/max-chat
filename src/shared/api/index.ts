export { getStateInstance, sendMessage, receiveNotification, deleteNotification } from './client'
export { ApiError } from './errors'
export { isMessageNotification, isTextMessage } from './notifications'
export type {
  GreenApiCredentials,
  InstanceState,
  GetStateInstanceResult,
  SendMessageResult,
  DeleteNotificationResult,
  ChatType,
  NotificationSenderData,
  TextMessageData,
  TextMessagePayload,
  UnknownMessagePayload,
  NotificationMessageData,
  MessageTypeWebhook,
  MessageNotificationBody,
  OtherNotificationBody,
  NotificationBody,
  ReceivedNotification,
} from './types'
