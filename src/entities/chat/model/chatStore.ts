import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { StateStorage } from 'zustand/middleware'
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

const HISTORY_KEY_PREFIX = 'max-chat-history'

const initialState = { chats: [], activeChatId: null }

let historyKey: string | null = null

const historyStorage: StateStorage = {
  getItem: () => {
    try {
      return historyKey ? localStorage.getItem(historyKey) : null
    } catch {
      return null
    }
  },
  setItem: (_name, value) => {
    try {
      if (historyKey) {
        localStorage.setItem(historyKey, value)
      }
    } catch {
      return
    }
  },
  removeItem: () => {
    try {
      if (historyKey) {
        localStorage.removeItem(historyKey)
      }
    } catch {
      return
    }
  },
}

function createChat({ id, phone, name }: NewChat): Chat {
  return name ? { id, phone, name, messages: [] } : { id, phone, messages: [] }
}

function hasMessage(chat: Chat, idMessage: string): boolean {
  return chat.messages.some((message) => message.idMessage === idMessage)
}

function restoreChats(persisted: unknown): Chat[] {
  const chats = (persisted as { chats?: unknown } | null)?.chats
  if (!Array.isArray(chats)) {
    return []
  }

  return (chats as Chat[]).map((chat) => ({
    ...chat,
    messages: chat.messages.map((message) =>
      message.status === 'pending' ? { ...message, status: 'error' } : message,
    ),
  }))
}

const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
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
              return {
                ...chat,
                messages: chat.messages.filter((message) => message.id !== messageId),
              }
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
    }),
    {
      name: HISTORY_KEY_PREFIX,
      version: 1,
      storage: createJSONStorage(() => historyStorage),
      partialize: (state) => ({ chats: state.chats }),
      merge: (persisted, current) => ({ ...current, chats: restoreChats(persisted) }),
      skipHydration: true,
    },
  ),
)

function openChatHistory(idInstance: string): void {
  historyKey = `${HISTORY_KEY_PREFIX}:${idInstance}`
  void useChatStore.persist.rehydrate()
}

function closeChatHistory(): void {
  historyKey = null
  useChatStore.getState().reset()
}

export { closeChatHistory, openChatHistory, useChatStore }
