import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Button from './Button'

describe('Button', () => {
  it('renders children and handles click', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Отправить</Button>)

    await userEvent.click(screen.getByRole('button', { name: 'Отправить' }))

    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('applies the secondary variant class', () => {
    render(<Button variant="secondary">Новый чат</Button>)

    expect(screen.getByRole('button', { name: 'Новый чат' }).className).toContain('secondary')
  })
})
