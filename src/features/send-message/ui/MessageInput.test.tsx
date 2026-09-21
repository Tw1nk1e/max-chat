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

  it('disables the button while the field is empty', async () => {
    render(<MessageInput onSend={() => true} />)

    expect(screen.getByRole('button', { name: 'Отправить' })).toBeDisabled()

    await userEvent.type(screen.getByLabelText('Сообщение'), 'Привет')

    expect(screen.getByRole('button', { name: 'Отправить' })).toBeEnabled()
  })

  it('sends on button click', async () => {
    const onSend = vi.fn(() => true)
    render(<MessageInput onSend={onSend} />)

    await userEvent.type(screen.getByLabelText('Сообщение'), 'Привет')
    await userEvent.click(screen.getByRole('button', { name: 'Отправить' }))

    expect(onSend).toHaveBeenCalledWith('Привет')
  })
})
