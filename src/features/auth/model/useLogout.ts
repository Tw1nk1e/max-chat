import { closeChatHistory } from '../../../entities/chat'
import { useSessionStore } from '../../../entities/session'

function useLogout(): () => void {
  const clearCredentials = useSessionStore((state) => state.clearCredentials)

  return () => {
    clearCredentials()
    closeChatHistory()
  }
}

export { useLogout }
