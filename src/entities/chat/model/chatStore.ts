import { create } from 'zustand'
import type { Chat, ChatMessage } from './types'

type NewChat = Pick<Chat, 'id' | 'phone' | 'name'>

type IncomingMessage = {
  chat: NewChat
  message: ChatMessage
}

type ChatState = {
  chats: Chat[]
  activeChatId: string | null
  addChat: (chat: NewChat) => void
  selectChat: (chatId: string | null) => void
  addMessage: (chatId: string, message: ChatMessage) => void
  updateMessage: (chatId: string, messageId: string, patch: Partial<ChatMessage>) => void
  confirmMessage: (chatId: string, messageId: string, idMessage: string) => void
  receiveMessage: (incoming: IncomingMessage) => void
  reset: () => void
}

const initialState = { chats: [], activeChatId: null }

function createChat({ id, phone, name }: NewChat): Chat {
  return name ? { id, phone, name, messages: [] } : { id, phone, messages: [] }
}

function hasMessage(chat: Chat, idMessage: string): boolean {
  return chat.messages.some((message) => message.idMessage === idMessage)
}

const useChatStore = create<ChatState>()((set) => ({
  ...initialState,
  addChat: (chat) => set((state) => ({ chats: [createChat(chat), ...state.chats] })),
  selectChat: (chatId) => set({ activeChatId: chatId }),
  addMessage: (chatId, message) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId ? { ...chat, messages: [...chat.messages, message] } : chat,
      ),
    })),
  updateMessage: (chatId, messageId, patch) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: chat.messages.map((message) =>
                message.id === messageId ? { ...message, ...patch } : message,
              ),
            }
          : chat,
      ),
    })),
  confirmMessage: (chatId, messageId, idMessage) =>
    set((state) => ({
      chats: state.chats.map((chat) => {
        if (chat.id !== chatId) {
          return chat
        }

        if (hasMessage(chat, idMessage)) {
          return { ...chat, messages: chat.messages.filter((message) => message.id !== messageId) }
        }

        return {
          ...chat,
          messages: chat.messages.map((message) =>
            message.id === messageId ? { ...message, idMessage, status: 'sent' } : message,
          ),
        }
      }),
    })),
  receiveMessage: ({ chat, message }) =>
    set((state) => {
      const existing = state.chats.find((item) => item.id === chat.id)

      if (!existing) {
        return { chats: [{ ...createChat(chat), messages: [message] }, ...state.chats] }
      }

      if (message.idMessage && hasMessage(existing, message.idMessage)) {
        return state
      }

      return {
        chats: state.chats.map((item) =>
          item.id === chat.id ? { ...item, messages: [...item.messages, message] } : item,
        ),
      }
    }),
  reset: () => set(initialState),
}))

export { useChatStore }
