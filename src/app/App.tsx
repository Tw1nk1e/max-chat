import { useSessionStore } from '../entities/session'
import { ChatPage } from '../pages/chat'
import { LoginPage } from '../pages/login'

function App() {
  const isAuthenticated = useSessionStore((state) => state.credentials !== null)

  return isAuthenticated ? <ChatPage /> : <LoginPage />
}

export default App
