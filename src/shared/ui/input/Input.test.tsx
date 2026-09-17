import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import Input from './Input'

describe('Input', () => {
  it('associates the label with the field', async () => {
    render(<Input label="idInstance" />)

    const input = screen.getByLabelText('idInstance')
    await userEvent.type(input, '12345')

    expect(input).toHaveValue('12345')
  })

  it('shows an error message', () => {
    render(<Input label="idInstance" error="Обязательное поле" />)

    expect(screen.getByText('Обязательное поле')).toBeInTheDocument()
    expect(screen.getByLabelText('idInstance')).toHaveAttribute('aria-invalid', 'true')
  })
})
