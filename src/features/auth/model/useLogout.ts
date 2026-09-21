import { useChatStore } from '../../../entities/chat'
import { useSessionStore } from '../../../entities/session'

function useLogout(): () => void {
  const clearCredentials = useSessionStore((state) => state.clearCredentials)
  const resetChats = useChatStore((state) => state.reset)

  return () => {
    clearCredentials()
    resetChats()
  }
}

export { useLogout }
