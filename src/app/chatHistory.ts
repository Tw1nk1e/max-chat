import { openChatHistory } from '../entities/chat'
import { useSessionStore } from '../entities/session'

function syncChatHistoryWithSession(): () => void {
  const openForCurrentSession = () => {
    const { credentials } = useSessionStore.getState()
    if (credentials) {
      openChatHistory(credentials.idInstance)
    }
  }

  openForCurrentSession()

  return useSessionStore.subscribe((state, previous) => {
    if (state.credentials?.idInstance !== previous.credentials?.idInstance) {
      openForCurrentSession()
    }
  })
}

export { syncChatHistoryWithSession }
