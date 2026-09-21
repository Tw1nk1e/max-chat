import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import MessageInput from './MessageInput'

describe('MessageInput', () => {
  it('sends on Enter and clears the field', async () => {
    const onSend = vi.fn(() => true)
    render(<MessageInput onSend={onSend} />)

    await userEvent.type(screen.getByLabelText('Сообщение'), 'Привет{Enter}')

    expect(onSend).toHaveBeenCalledWith('Привет')
    expect(screen.getByLabelText('Сообщение')).toHaveValue('')
  })

  it('adds a new line on Shift+Enter instead of sending', async () => {
    const onSend = vi.fn(() => true)
    render(<MessageInput onSend={onSend} />)

    await userEvent.type(screen.getByLabelText('Сообщение'), 'a{Shift>}{Enter}{/Shift}b')

    expect(onSend).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Сообщение')).toHaveValue('a\nb')
  })

  it('shows the send arrow only when there is something to send', async () => {
    render(<MessageInput onSend={() => true} />)

    expect(screen.queryByRole('button', { name: 'Отправить' })).not.toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Сообщение'), '   ')
    expect(screen.queryByRole('button', { name: 'Отправить' })).not.toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Сообщение'), 'Привет')
    expect(screen.getByRole('button', { name: 'Отправить' })).toBeInTheDocument()
  })

  it('hides the send arrow again after sending', async () => {
    render(<MessageInput onSend={() => true} />)

    await userEvent.type(screen.getByLabelText('Сообщение'), 'Привет')
    await userEvent.click(screen.getByRole('button', { name: 'Отправить' }))

    expect(screen.queryByRole('button', { name: 'Отправить' })).not.toBeInTheDocument()
  })

  it('grows with the text but never above the limit', async () => {
    let contentHeight = 40
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      get: () => contentHeight,
    })
    render(<MessageInput onSend={() => true} />)
    const input = screen.getByLabelText('Сообщение')

    contentHeight = 88
    await userEvent.type(input, 'a')
    expect(input.style.height).toBe('88px')

    contentHeight = 500
    await userEvent.type(input, 'b')
    expect(input.style.height).toBe('160px')

    Reflect.deleteProperty(HTMLElement.prototype, 'scrollHeight')
  })

  it('sends on button click', async () => {
    const onSend = vi.fn(() => true)
    render(<MessageInput onSend={onSend} />)

    await userEvent.type(screen.getByLabelText('Сообщение'), 'Привет')
    await userEvent.click(screen.getByRole('button', { name: 'Отправить' }))

    expect(onSend).toHaveBeenCalledWith('Привет')
  })

  it('limits the message length to what GREEN-API accepts', () => {
    render(<MessageInput onSend={() => true} />)

    expect(screen.getByLabelText('Сообщение')).toHaveAttribute('maxlength', '4000')
  })
})
