import { create } from 'zustand'
import type { Chat, ChatMessage } from './types'

type ChatState = {
  chats: Chat[]
  activeChatId: string | null
  addChat: (chat: Pick<Chat, 'id' | 'phone'>) => void
  selectChat: (chatId: string | null) => void
  addMessage: (chatId: string, message: ChatMessage) => void
  updateMessage: (chatId: string, messageId: string, patch: Partial<ChatMessage>) => void
  reset: () => void
}

const initialState = { chats: [], activeChatId: null }

const useChatStore = create<ChatState>()((set) => ({
  ...initialState,
  addChat: ({ id, phone }) =>
    set((state) => ({ chats: [{ id, phone, messages: [] }, ...state.chats] })),
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
  reset: () => set(initialState),
}))

export { useChatStore }
