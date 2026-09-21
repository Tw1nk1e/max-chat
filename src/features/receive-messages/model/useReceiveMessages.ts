import { useEffect, useState } from 'react'
import { useSessionStore } from '../../../entities/session'
import { handleNotification } from './handleNotification'
import { pollNotifications } from './pollNotifications'
import type { ConnectionStatus } from './pollNotifications'

type ReceiveState = {
  status: ConnectionStatus
  error: string | null
}

function useReceiveMessages(): ReceiveState {
  const credentials = useSessionStore((state) => state.credentials)
  const [state, setState] = useState<ReceiveState>({ status: 'online', error: null })

  useEffect(() => {
    if (!credentials) {
      return
    }

    const controller = new AbortController()
    void pollNotifications({
      credentials,
      signal: controller.signal,
      onConnectionChange: (status, error) => setState({ status, error }),
      onNotification: handleNotification,
    })

    return () => controller.abort()
  }, [credentials])

  return state
}

export { useReceiveMessages }
