import { useSessionStore } from '../../../entities/session'

function useLogout(): () => void {
  return useSessionStore((state) => state.clearCredentials)
}

export { useLogout }
