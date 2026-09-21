import { afterEach, describe, expect, it } from 'vitest'
import { useSessionStore } from './sessionStore'

const credentials = {
  apiUrl: 'https://3100.api.green-api.com',
  idInstance: '1234567890',
  apiTokenInstance: 'test-token',
}

afterEach(() => {
  useSessionStore.setState({ credentials: null })
  sessionStorage.clear()
})

describe('useSessionStore', () => {
  it('starts without credentials', () => {
    expect(useSessionStore.getState().credentials).toBeNull()
  })

  it('stores credentials in sessionStorage', () => {
    useSessionStore.getState().setCredentials(credentials)

    expect(useSessionStore.getState().credentials).toEqual(credentials)
    expect(sessionStorage.getItem('max-chat-session')).toContain('test-token')
  })

  it('clears credentials and sessionStorage on logout', () => {
    useSessionStore.getState().setCredentials(credentials)
    useSessionStore.getState().clearCredentials()

    expect(useSessionStore.getState().credentials).toBeNull()
    expect(sessionStorage.getItem('max-chat-session')).not.toContain('test-token')
  })
})
