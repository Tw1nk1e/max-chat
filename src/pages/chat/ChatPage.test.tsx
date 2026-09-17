import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ChatPage from './ChatPage'

describe('ChatPage', () => {
  it('renders the chat list and the first conversation by default', () => {
    render(<ChatPage />)

    expect(screen.getByRole('heading', { name: 'MAX Chat' })).toBeInTheDocument()
    expect(screen.getAllByText('+7 999 123-45-67').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Привет! Как дела?').length).toBeGreaterThan(0)
  })
})
