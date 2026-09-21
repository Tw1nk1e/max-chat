import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useSessionStore } from '../entities/session'
import { idleReceiveNotification } from '../test/msw/handlers'
import { server } from '../test/msw/server'
import { createQueryWrapper } from '../test/queryWrapper'
import App from './App'

afterEach(() => {
  useSessionStore.setState({ credentials: null })
  sessionStorage.clear()
})

describe('App', () => {
  it('renders the login page when there is no session', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'MAX Chat' })).toBeInTheDocument()
    expect(screen.getByLabelText('idInstance')).toBeInTheDocument()
  })

  it('renders the chat page when a session is present', () => {
    const credentials = {
      apiUrl: 'https://test.green-api.local',
      idInstance: '1234567890',
      apiTokenInstance: 'test-token',
    }
    useSessionStore.getState().setCredentials(credentials)
    server.use(idleReceiveNotification(credentials))

    render(<App />, { wrapper: createQueryWrapper() })

    expect(screen.queryByLabelText('idInstance')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Новый чат' })).toBeInTheDocument()
  })
})
