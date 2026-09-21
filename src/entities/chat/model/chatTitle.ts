import { formatPhone } from '../../../shared/lib'
import type { Chat } from './types'

function getChatTitle(chat: Chat): string {
  if (chat.phone) {
    return formatPhone(chat.phone)
  }

  return chat.name || chat.id
}

export { getChatTitle }
