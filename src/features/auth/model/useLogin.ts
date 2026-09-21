import { useState } from 'react'
import { useSessionStore } from '../../../entities/session'
import type { SessionCredentials } from '../../../entities/session'
import { ApiError, getStateInstance } from '../../../shared/api'
import { stateInstanceMessage } from './stateInstanceMessage'

type LoginStatus = 'idle' | 'pending' | 'error'

function useLogin() {
  const setCredentials = useSessionStore((state) => state.setCredentials)
  const [status, setStatus] = useState<LoginStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  async function login(credentials: SessionCredentials): Promise<void> {
    setStatus('pending')
    setError(null)

    try {
      const { stateInstance } = await getStateInstance(credentials)

      if (stateInstance !== 'authorized') {
        setStatus('error')
        setError(stateInstanceMessage(stateInstance))
        return
      }

      setCredentials(credentials)
      setStatus('idle')
    } catch (cause) {
      setStatus('error')
      setError(cause instanceof ApiError ? cause.message : 'Не удалось подключиться к GREEN-API')
    }
  }

  return { login, status, error }
}

export { useLogin }
