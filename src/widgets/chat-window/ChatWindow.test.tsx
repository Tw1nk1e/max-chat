import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ChatWindow from './ChatWindow'

describe('ChatWindow', () => {
  it('shows a placeholder when no chat is selected', () => {
    render(<ChatWindow phone={null} messages={[]} onBack={() => {}} />)

    expect(screen.getByText('Выберите чат или создайте новый')).toBeInTheDocument()
  })

  it('shows a placeholder when the chat has no messages', () => {
    render(<ChatWindow phone="+7 999 123-45-67" messages={[]} onBack={() => {}} />)

    expect(screen.getByText('Сообщений пока нет')).toBeInTheDocument()
  })

  it('renders messages in order', () => {
    render(
      <ChatWindow
        phone="+7 999 123-45-67"
        messages={[
          { id: 'm1', text: 'Привет', time: '14:20', direction: 'out' },
          { id: 'm2', text: 'Как дела?', time: '14:32', direction: 'in' },
        ]}
        onBack={() => {}}
      />,
    )

    expect(screen.getByText('Привет')).toBeInTheDocument()
    expect(screen.getByText('Как дела?')).toBeInTheDocument()
  })
})
