import { useMutation } from '@tanstack/react-query'
import { useChatStore } from '../../../entities/chat'
import { useSessionStore } from '../../../entities/session'
import { sendMessage } from '../../../shared/api'

type SendVariables = {
  chatId: string
  messageId: string
  text: string
}

function useSendMessage() {
  const mutation = useMutation({
    mutationFn: ({ chatId, text }: SendVariables) => {
      const credentials = useSessionStore.getState().credentials
      if (!credentials) {
        throw new Error('Сессия не найдена')
      }
      return sendMessage(credentials, chatId, text)
    },
    onSuccess: (result, { chatId, messageId }) => {
      useChatStore.getState().confirmMessage(chatId, messageId, result.idMessage)
    },
    onError: (_error, { chatId, messageId }) => {
      useChatStore.getState().updateMessage(chatId, messageId, { status: 'error' })
    },
  })

  function send(chatId: string, rawText: string): boolean {
    const text = rawText.trim()
    if (!text) {
      return false
    }

    const messageId = crypto.randomUUID()
    useChatStore.getState().addMessage(chatId, {
      id: messageId,
      idMessage: null,
      text,
      timestamp: Date.now(),
      direction: 'out',
      status: 'pending',
    })
    mutation.mutate({ chatId, messageId, text })
    return true
  }

  function retry(chatId: string, messageId: string): void {
    const chat = useChatStore.getState().chats.find((item) => item.id === chatId)
    const message = chat?.messages.find((item) => item.id === messageId)
    if (!message || message.status !== 'error') {
      return
    }

    useChatStore.getState().updateMessage(chatId, messageId, { status: 'pending' })
    mutation.mutate({ chatId, messageId, text: message.text })
  }

  return { send, retry }
}

export { useSendMessage }
