import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type SessionCredentials = {
  apiUrl: string
  idInstance: string
  apiTokenInstance: string
}

type SessionState = {
  credentials: SessionCredentials | null
  setCredentials: (credentials: SessionCredentials) => void
  clearCredentials: () => void
}

const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      credentials: null,
      setCredentials: (credentials) => set({ credentials }),
      clearCredentials: () => set({ credentials: null }),
    }),
    {
      name: 'max-chat-session',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)

export { useSessionStore }
export type { SessionCredentials, SessionState }
