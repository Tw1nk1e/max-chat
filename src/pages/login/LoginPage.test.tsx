import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import LoginPage from './LoginPage'

describe('LoginPage', () => {
  it('renders the required fields', () => {
    render(<LoginPage />)

    expect(screen.getByLabelText('idInstance')).toBeInTheDocument()
    expect(screen.getByLabelText('apiTokenInstance')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument()
  })

  it('hides the apiUrl field behind the advanced section by default', async () => {
    render(<LoginPage />)

    expect(screen.queryByLabelText('apiUrl')).not.toBeVisible()

    await userEvent.click(screen.getByText('Дополнительно'))

    expect(screen.getByLabelText('apiUrl')).toBeVisible()
  })
})
