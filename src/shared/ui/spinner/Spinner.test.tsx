import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Spinner from './Spinner'

describe('Spinner', () => {
  it('renders a status role with a label', () => {
    render(<Spinner label="Загрузка чатов" />)

    expect(screen.getByRole('status', { name: 'Загрузка чатов' })).toBeInTheDocument()
  })
})
