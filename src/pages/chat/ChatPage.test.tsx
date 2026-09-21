import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useChatStore } from '../../entities/chat'
import { useSessionStore } from '../../entities/session'
import { server } from '../../test/msw/server'
import { createQueryWrapper } from '../../test/queryWrapper'
import ChatPage from './ChatPage'

const credentials = {
  apiUrl: 'https://test.green-api.local',
  idInstance: '1234567890',
  apiTokenInstance: 'test-token',
}

function methodUrl(method: string): string {
  return `${credentials.apiUrl}/waInstance${credentials.idInstance}/${method}/${credentials.apiTokenInstance}`
}

function renderPage() {
  render(<ChatPage />, { wrapper: createQueryWrapper() })
}

async function createChatByPhone(phone: string) {
  await userEvent.click(screen.getByRole('button', { name: 'Новый чат' }))
  await userEvent.type(screen.getByLabelText('Номер телефона'), phone)
  await userEvent.click(screen.getByRole('button', { name: 'Создать чат' }))
}

beforeEach(() => {
  useSessionStore.getState().setCredentials(credentials)
})

afterEach(() => {
  useSessionStore.setState({ credentials: null })
  useChatStore.getState().reset()
  sessionStorage.clear()
})

describe('ChatPage', () => {
  it('shows the empty states when there are no chats', () => {
    renderPage()

    expect(screen.getByText('Чатов пока нет')).toBeInTheDocument()
    expect(screen.getByText('Выберите чат или создайте новый')).toBeInTheDocument()
  })

  it('creates a chat by phone number and opens it', async () => {
    server.use(
      http.post(methodUrl('checkAccount'), () =>
        HttpResponse.json({ exist: true, chatId: '10000000', fromCache: false }),
      ),
    )
    renderPage()

    await createChatByPhone('89991234567')

    expect(await screen.findByText('Сообщений пока нет')).toBeInTheDocument()
    expect(screen.getAllByText('+7 999 123-45-67').length).toBeGreaterThan(0)
    expect(screen.queryByLabelText('Номер телефона')).not.toBeInTheDocument()
  })

  it('shows an error for an invalid phone number', async () => {
    renderPage()

    await createChatByPhone('123')

    expect(await screen.findByText(/Введите номер РФ/)).toBeInTheDocument()
    expect(useChatStore.getState().chats).toEqual([])
  })

  it('sends a message and shows it in the chat and in the list', async () => {
    server.use(http.post(methodUrl('sendMessage'), () => HttpResponse.json({ idMessage: 'srv-1' })))
    useChatStore.getState().addChat({ id: '10000000', phone: '79991234567' })
    useChatStore.getState().selectChat('10000000')
    renderPage()

    await userEvent.type(screen.getByLabelText('Сообщение'), 'Привет{Enter}')

    expect(await screen.findAllByText('Привет')).toHaveLength(2)
    expect(useChatStore.getState().chats[0].messages[0]).toMatchObject({
      status: 'sent',
      idMessage: 'srv-1',
    })
  })

  it('lets the user retry a failed message', async () => {
    server.use(http.post(methodUrl('sendMessage'), () => new HttpResponse(null, { status: 500 })))
    useChatStore.getState().addChat({ id: '10000000', phone: '79991234567' })
    useChatStore.getState().selectChat('10000000')
    renderPage()

    await userEvent.type(screen.getByLabelText('Сообщение'), 'Привет{Enter}')
    expect(await screen.findByText('Не отправлено')).toBeInTheDocument()

    server.use(http.post(methodUrl('sendMessage'), () => HttpResponse.json({ idMessage: 'srv-2' })))
    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }))

    await waitFor(() => expect(useChatStore.getState().chats[0].messages[0].status).toBe('sent'))
    expect(screen.queryByText('Не отправлено')).not.toBeInTheDocument()
  })

  it('clears the session and the chats on logout', async () => {
    useChatStore.getState().addChat({ id: '10000000', phone: '79991234567' })
    renderPage()

    await userEvent.click(screen.getByRole('button', { name: 'Выйти' }))

    expect(useSessionStore.getState().credentials).toBeNull()
    expect(useChatStore.getState().chats).toEqual([])
  })
})
