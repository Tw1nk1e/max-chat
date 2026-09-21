import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { afterEach, describe, expect, it } from 'vitest'
import { useSessionStore } from '../../../entities/session'
import { server } from '../../../test/msw/server'
import LoginForm from './LoginForm'

const apiUrl = 'https://test.green-api.local'
const idInstance = '1234567890'

function methodUrl(apiTokenInstance: string, method: string): string {
  return `${apiUrl}/waInstance${idInstance}/${method}/${apiTokenInstance}`
}

afterEach(() => {
  useSessionStore.setState({ credentials: null })
  sessionStorage.clear()
})

async function fillForm(apiTokenInstance: string): Promise<void> {
  await userEvent.type(screen.getByLabelText('idInstance'), idInstance)
  await userEvent.type(screen.getByLabelText('apiTokenInstance'), apiTokenInstance)
  await userEvent.click(screen.getByText('Дополнительно'))
  await userEvent.type(screen.getByLabelText('apiUrl'), apiUrl)
  await userEvent.click(screen.getByRole('button', { name: 'Войти' }))
}

describe('LoginForm', () => {
  it('stores credentials when the instance is authorized', async () => {
    const apiTokenInstance = 'test-token'

    server.use(
      http.get(methodUrl(apiTokenInstance, 'getStateInstance'), () =>
        HttpResponse.json({ stateInstance: 'authorized' }),
      ),
    )

    render(<LoginForm />)
    await fillForm(apiTokenInstance)

    await screen.findByRole('button', { name: 'Войти' })

    expect(useSessionStore.getState().credentials).toEqual({ apiUrl, idInstance, apiTokenInstance })
  })

  it('shows a readable error and keeps the session empty on failure', async () => {
    const apiTokenInstance = 'wrong-token'

    server.use(
      http.get(
        methodUrl(apiTokenInstance, 'getStateInstance'),
        () => new HttpResponse(null, { status: 401 }),
      ),
    )

    render(<LoginForm />)
    await fillForm(apiTokenInstance)

    expect(await screen.findByRole('alert')).toHaveTextContent('Неверный apiTokenInstance')
    expect(useSessionStore.getState().credentials).toBeNull()
  })

  it('opens the advanced section and shows an error when apiUrl is empty', async () => {
    render(<LoginForm />)

    await userEvent.type(screen.getByLabelText('idInstance'), idInstance)
    await userEvent.type(screen.getByLabelText('apiTokenInstance'), 'test-token')
    await userEvent.click(screen.getByRole('button', { name: 'Войти' }))

    expect(screen.getByLabelText('apiUrl')).toBeVisible()
    expect(screen.getByText('Укажите apiUrl из личного кабинета GREEN-API')).toBeInTheDocument()
    expect(useSessionStore.getState().credentials).toBeNull()
  })
})
