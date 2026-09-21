import { useEffect, useState } from 'react'
import { useSessionStore } from '../../../entities/session'
import { handleNotification } from './handleNotification'
import { pollNotifications } from './pollNotifications'
import type { ConnectionStatus } from './pollNotifications'

function useReceiveMessages(): ConnectionStatus {
  const credentials = useSessionStore((state) => state.credentials)
  const [status, setStatus] = useState<ConnectionStatus>('online')

  useEffect(() => {
    if (!credentials) {
      return
    }

    const controller = new AbortController()
    void pollNotifications({
      credentials,
      signal: controller.signal,
      onConnectionChange: setStatus,
      onNotification: handleNotification,
    })

    return () => controller.abort()
  }, [credentials])

  return status
}

export { useReceiveMessages }
