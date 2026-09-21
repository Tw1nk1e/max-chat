import { act, renderHook } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { afterEach, describe, expect, it } from 'vitest'
import { useSessionStore } from '../../../entities/session'
import { server } from '../../../test/msw/server'
import { useLogin } from './useLogin'

const credentials = {
  apiUrl: 'https://test.green-api.local',
  idInstance: '1234567890',
  apiTokenInstance: 'test-token',
}

function methodUrl(method: string): string {
  return `${credentials.apiUrl}/waInstance${credentials.idInstance}/${method}/${credentials.apiTokenInstance}`
}

afterEach(() => {
  useSessionStore.setState({ credentials: null })
  sessionStorage.clear()
})

describe('useLogin', () => {
  it('stores credentials when the instance is authorized', async () => {
    server.use(
      http.get(methodUrl('getStateInstance'), () =>
        HttpResponse.json({ stateInstance: 'authorized' }),
      ),
    )

    const { result } = renderHook(() => useLogin())

    await act(async () => {
      await result.current.login(credentials)
    })

    expect(useSessionStore.getState().credentials).toEqual(credentials)
    expect(result.current.status).toBe('idle')
    expect(result.current.error).toBeNull()
  })

  it('shows a readable error when the instance is not authorized', async () => {
    server.use(
      http.get(methodUrl('getStateInstance'), () =>
        HttpResponse.json({ stateInstance: 'notAuthorized' }),
      ),
    )

    const { result } = renderHook(() => useLogin())

    await act(async () => {
      await result.current.login(credentials)
    })

    expect(useSessionStore.getState().credentials).toBeNull()
    expect(result.current.status).toBe('error')
    expect(result.current.error).toContain('не авторизован')
  })

  it('shows the ApiError message on a failed request', async () => {
    server.use(
      http.get(methodUrl('getStateInstance'), () => new HttpResponse(null, { status: 401 })),
    )

    const { result } = renderHook(() => useLogin())

    await act(async () => {
      await result.current.login(credentials)
    })

    expect(useSessionStore.getState().credentials).toBeNull()
    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('Неверный apiTokenInstance')
  })
})
