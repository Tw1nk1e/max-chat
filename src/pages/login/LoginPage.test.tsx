import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import LoginPage from './LoginPage'

describe('LoginPage', () => {
  it('renders the required fields', () => {
    render(<LoginPage />)

    expect(screen.getByLabelText('idInstance')).toBeInTheDocument()
    expect(screen.getByLabelText('apiTokenInstance')).toBeInTheDocument()
    expect(screen.getByLabelText('apiUrl')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument()
  })

  it('marks every field as required', () => {
    render(<LoginPage />)

    for (const label of ['idInstance', 'apiTokenInstance', 'apiUrl']) {
      expect(screen.getByLabelText(label)).toBeRequired()
    }
  })
})
