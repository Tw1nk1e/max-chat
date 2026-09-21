type MessageDirection = 'in' | 'out'

type MessageStatus = 'pending' | 'sent' | 'error'

type ChatMessage = {
  id: string
  idMessage: string | null
  text: string
  timestamp: number
  direction: MessageDirection
  status: MessageStatus
}

type Chat = {
  id: string
  phone: string
  name?: string
  messages: ChatMessage[]
}

export type { Chat, ChatMessage, MessageDirection, MessageStatus }
