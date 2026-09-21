type GreenApiCredentials = {
  apiUrl: string
  idInstance: string
  apiTokenInstance: string
}

type InstanceState =
  'notAuthorized' | 'authorized' | 'blocked' | 'starting' | 'suspended' | 'pendingPassword'

type GetStateInstanceResult = {
  stateInstance: InstanceState
}

type SendMessageResult = {
  idMessage: string
}

type CheckAccountResult = {
  exist: boolean
  chatId: string
  fromCache: boolean
}

type CheckAccountRejected = {
  status: false
  reason: string
}

type DeleteNotificationResult = {
  result: boolean
  reason: string
}

type ChatType = 'user' | 'group' | 'channel' | 'bot'

type NotificationSenderData = {
  chatId: string
  chatName: string
  chatType: ChatType
  sender: string
  senderName: string
  senderType: ChatType
  senderContactName: string
  senderPhoneNumber: number
}

type TextMessageData = {
  textMessage: string
  isForwarded?: boolean
  forwardingScore?: number
}

type TextMessagePayload = {
  typeMessage: 'textMessage'
  textMessageData: TextMessageData
}

type UnknownMessagePayload = {
  typeMessage: string
}

type NotificationMessageData = TextMessagePayload | UnknownMessagePayload

type MessageTypeWebhook =
  'incomingMessageReceived' | 'outgoingMessageReceived' | 'outgoingAPIMessageReceived'

type MessageNotificationBody = {
  typeWebhook: MessageTypeWebhook
  instanceData: {
    idInstance: number
    wid: string
    typeInstance: string
  }
  timestamp: number
  idMessage: string
  senderData: NotificationSenderData
  messageData: NotificationMessageData
}

type OtherNotificationBody = {
  typeWebhook: 'outgoingMessageStatus' | 'stateInstanceChanged' | 'quotaExceeded'
}

type NotificationBody = MessageNotificationBody | OtherNotificationBody

type ReceivedNotification = {
  receiptId: number
  body: NotificationBody
}

export type {
  GreenApiCredentials,
  InstanceState,
  GetStateInstanceResult,
  SendMessageResult,
  CheckAccountResult,
  CheckAccountRejected,
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
}
