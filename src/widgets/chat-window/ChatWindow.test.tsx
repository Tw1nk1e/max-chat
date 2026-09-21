import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
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

const scrolled: number[] = []

function mockScrollGeometry(scrollHeight: number, clientHeight: number) {
  Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
    configurable: true,
    get: () => scrollHeight,
  })
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get: () => clientHeight,
  })
  Object.defineProperty(HTMLElement.prototype, 'scrollTop', {
    configurable: true,
    get: () => 0,
    set: (value: number) => scrolled.push(value),
  })
}

afterEach(() => {
  scrolled.length = 0
  Reflect.deleteProperty(HTMLElement.prototype, 'scrollHeight')
  Reflect.deleteProperty(HTMLElement.prototype, 'clientHeight')
  Reflect.deleteProperty(HTMLElement.prototype, 'scrollTop')
})

const sent = (id: string, direction: 'in' | 'out' = 'in'): ChatWindowMessage => ({
  id,
  text: id,
  time: '10:00',
  direction,
  status: 'sent',
})

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

  it('marks who wrote each message for screen readers', () => {
    renderWindow('+7 999 123-45-67', [sent('a', 'out'), sent('b', 'in')])

    expect(screen.getByText('Вы:')).toBeInTheDocument()
    expect(screen.getByText('Собеседник:')).toBeInTheDocument()
    expect(screen.getByRole('log', { name: 'Сообщения' })).toBeInTheDocument()
  })

  it('scrolls to the newest message when the chat opens and when messages arrive', () => {
    mockScrollGeometry(1000, 400)
    const { rerender } = render(
      <ChatWindow
        phone="+7 999 123-45-67"
        messages={[sent('a')]}
        composer={composer}
        onBack={() => {}}
        onRetryMessage={() => {}}
      />,
    )
    expect(scrolled).toEqual([1000])

    rerender(
      <ChatWindow
        phone="+7 999 123-45-67"
        messages={[sent('a'), sent('b')]}
        composer={composer}
        onBack={() => {}}
        onRetryMessage={() => {}}
      />,
    )

    expect(scrolled).toEqual([1000, 1000])
  })

  it('does not pull the reader down when they scrolled up and an incoming message arrives', () => {
    mockScrollGeometry(1000, 400)
    const { rerender } = render(
      <ChatWindow
        phone="+7 999 123-45-67"
        messages={[sent('a')]}
        composer={composer}
        onBack={() => {}}
        onRetryMessage={() => {}}
      />,
    )
    scrolled.length = 0

    fireEvent.scroll(screen.getByRole('log'))
    rerender(
      <ChatWindow
        phone="+7 999 123-45-67"
        messages={[sent('a'), sent('b', 'in')]}
        composer={composer}
        onBack={() => {}}
        onRetryMessage={() => {}}
      />,
    )
    expect(scrolled).toEqual([])

    rerender(
      <ChatWindow
        phone="+7 999 123-45-67"
        messages={[sent('a'), sent('b', 'in'), sent('c', 'out')]}
        composer={composer}
        onBack={() => {}}
        onRetryMessage={() => {}}
      />,
    )
    expect(scrolled).toEqual([1000])
  })
})
