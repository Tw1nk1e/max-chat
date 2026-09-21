import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ChatList from './ChatList'

const chats = [
  { id: '1', phone: '+7 999 123-45-67', lastMessage: 'Привет', time: '14:32' },
  { id: '2', phone: '+7 912 555-11-22', lastMessage: 'Пока', time: 'Вчера' },
]

describe('ChatList', () => {
  it('renders chats and selects one on click', async () => {
    const onSelectChat = vi.fn()
    render(
      <ChatList
        chats={chats}
        activeChatId={null}
        onSelectChat={onSelectChat}
        onNewChat={() => {}}
        onLogout={() => {}}
        connectionStatus="online"
      />,
    )

    await userEvent.click(screen.getByText('+7 999 123-45-67'))

    expect(onSelectChat).toHaveBeenCalledWith('1')
  })

  it('calls onNewChat when the button is clicked', async () => {
    const onNewChat = vi.fn()
    render(
      <ChatList
        chats={chats}
        activeChatId={null}
        onSelectChat={() => {}}
        onNewChat={onNewChat}
        onLogout={() => {}}
        connectionStatus="online"
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Новый чат' }))

    expect(onNewChat).toHaveBeenCalledOnce()
  })

  it('calls onLogout when the button is clicked', async () => {
    const onLogout = vi.fn()
    render(
      <ChatList
        chats={chats}
        activeChatId={null}
        onSelectChat={() => {}}
        onNewChat={() => {}}
        onLogout={onLogout}
        connectionStatus="online"
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Выйти' }))

    expect(onLogout).toHaveBeenCalledOnce()
  })

  it('shows the reconnecting status', () => {
    render(
      <ChatList
        chats={chats}
        activeChatId={null}
        onSelectChat={() => {}}
        onNewChat={() => {}}
        onLogout={() => {}}
        connectionStatus="reconnecting"
      />,
    )

    expect(screen.getByText('Переподключение')).toBeInTheDocument()
  })

  it('shows an empty state when there are no chats', () => {
    render(
      <ChatList
        chats={[]}
        activeChatId={null}
        onSelectChat={() => {}}
        onNewChat={() => {}}
        onLogout={() => {}}
        connectionStatus="online"
      />,
    )

    expect(screen.getByText('Чатов пока нет')).toBeInTheDocument()
  })
})
