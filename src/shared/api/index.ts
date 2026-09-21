export {
  checkAccount,
  deleteNotification,
  getStateInstance,
  receiveNotification,
  sendMessage,
} from './client'
export { ApiError } from './errors'
export { isMessageNotification, isTextMessage } from './notifications'
export type {
  GreenApiCredentials,
  InstanceState,
  GetStateInstanceResult,
  SendMessageResult,
  CheckAccountResult,
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
