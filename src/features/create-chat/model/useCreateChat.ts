import { useState } from 'react'
import { useChatStore } from '../../../entities/chat'
import { useSessionStore } from '../../../entities/session'
import { ApiError, checkAccount } from '../../../shared/api'
import { normalizePhone } from '../../../shared/lib'

type CreateChatStatus = 'idle' | 'pending' | 'error'

const INVALID_PHONE_MESSAGE = 'Введите номер РФ (+7) или РБ (+375), например +7 999 123-45-67'
const NO_ACCOUNT_MESSAGE = 'На этом номере нет аккаунта MAX'

function useCreateChat() {
  const credentials = useSessionStore((state) => state.credentials)
  const [status, setStatus] = useState<CreateChatStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  function fail(message: string): false {
    setStatus('error')
    setError(message)
    return false
  }

  async function createChat(phoneInput: string): Promise<boolean> {
    const phone = normalizePhone(phoneInput)
    if (!phone) {
      return fail(INVALID_PHONE_MESSAGE)
    }

    const { chats, addChat, selectChat } = useChatStore.getState()
    const chatByPhone = chats.find((chat) => chat.phone === phone)
    if (chatByPhone) {
      selectChat(chatByPhone.id)
      setStatus('idle')
      setError(null)
      return true
    }

    if (!credentials) {
      return fail('Сессия не найдена, войдите заново')
    }

    setStatus('pending')
    setError(null)

    try {
      const account = await checkAccount(credentials, Number(phone))
      if (!account.exist) {
        return fail(NO_ACCOUNT_MESSAGE)
      }

      const existing = useChatStore.getState().chats.find((chat) => chat.id === account.chatId)
      if (!existing) {
        addChat({ id: account.chatId, phone })
      }
      selectChat(account.chatId)
      setStatus('idle')
      return true
    } catch (cause) {
      return fail(cause instanceof ApiError ? cause.message : 'Не удалось создать чат')
    }
  }

  return { createChat, status, error }
}

export { useCreateChat }
