import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ChatWindow from './ChatWindow'
import type { ChatWindowMessage } from './ChatWindow'

const composer = <div>composer</div>

function renderWindow(phone: string | null, messages: ChatWindowMessage[], onRetry = () => {}) {
  render(
    <ChatWindow
      phone={phone}
      messages={messages}
      composer={composer}
      onBack={() => {}}
      onRetryMessage={onRetry}
    />,
  )
}

describe('ChatWindow', () => {
  it('shows a placeholder when no chat is selected', () => {
    renderWindow(null, [])

    expect(screen.getByText('Выберите чат или создайте новый')).toBeInTheDocument()
    expect(screen.queryByText('composer')).not.toBeInTheDocument()
  })

  it('shows a placeholder when the chat has no messages', () => {
    renderWindow('+7 999 123-45-67', [])

    expect(screen.getByText('Сообщений пока нет')).toBeInTheDocument()
    expect(screen.getByText('composer')).toBeInTheDocument()
  })

  it('renders messages with their time', () => {
    renderWindow('+7 999 123-45-67', [
      { id: 'm1', text: 'Привет', time: '14:20', direction: 'out', status: 'sent' },
      { id: 'm2', text: 'Как дела?', time: '14:32', direction: 'in', status: 'sent' },
    ])

    expect(screen.getByText('Привет')).toBeInTheDocument()
    expect(screen.getByText('14:32')).toBeInTheDocument()
  })

  it('shows the sending state for pending messages', () => {
    renderWindow('+7 999 123-45-67', [
      { id: 'm1', text: 'Привет', time: '14:20', direction: 'out', status: 'pending' },
    ])

    expect(screen.getByText('Отправка...')).toBeInTheDocument()
  })

  it('offers a retry for failed messages', async () => {
    const onRetry = vi.fn()
    renderWindow(
      '+7 999 123-45-67',
      [{ id: 'm1', text: 'Привет', time: '14:20', direction: 'out', status: 'error' }],
      onRetry,
    )

    expect(screen.getByText('Не отправлено')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }))

    expect(onRetry).toHaveBeenCalledWith('m1')
  })
})
