import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { useSessionStore } from '../../entities/session'
import ChatPage from './ChatPage'

afterEach(() => {
  useSessionStore.setState({ credentials: null })
  sessionStorage.clear()
})

describe('ChatPage', () => {
  it('renders the chat list and the first conversation by default', () => {
    render(<ChatPage />)

    expect(screen.getByRole('heading', { name: 'MAX Chat' })).toBeInTheDocument()
    expect(screen.getAllByText('+7 999 123-45-67').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Привет! Как дела?').length).toBeGreaterThan(0)
  })

  it('clears the session when the logout button is clicked', async () => {
    useSessionStore.getState().setCredentials({
      apiUrl: 'https://test.green-api.local',
      idInstance: '1234567890',
      apiTokenInstance: 'test-token',
    })

    render(<ChatPage />)
    await userEvent.click(screen.getByRole('button', { name: 'Выйти' }))

    expect(useSessionStore.getState().credentials).toBeNull()
  })
})
