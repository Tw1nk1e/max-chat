import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, delay, http } from 'msw'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useChatStore } from '../../entities/chat'
import { useSessionStore } from '../../entities/session'
import { idleReceiveNotification } from '../../test/msw/handlers'
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
  server.use(idleReceiveNotification(credentials))
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

  it('shows an incoming message from an unknown number and creates a chat for it', async () => {
    let receiveCount = 0
    server.use(
      http.get(methodUrl('receiveNotification'), async () => {
        receiveCount += 1
        if (receiveCount > 1) {
          await delay('infinite')
        }
        return HttpResponse.json({
          receiptId: 7,
          body: {
            typeWebhook: 'incomingMessageReceived',
            instanceData: { idInstance: 1234567890, wid: '79990000000@c.us', typeInstance: 'v3' },
            timestamp: 1763115112,
            idMessage: 'in-1',
            senderData: {
              chatId: '20000000',
              chatName: 'Иван',
              chatType: 'user',
              sender: '20000000',
              senderName: 'Иван',
              senderType: 'user',
              senderContactName: 'Иван',
              senderPhoneNumber: 79995554433,
            },
            messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: 'Ответ' } },
          },
        })
      }),
      http.delete(`${methodUrl('deleteNotification')}/7`, () =>
        HttpResponse.json({ result: true, reason: '' }),
      ),
    )
    renderPage()

    expect(await screen.findByText('+7 999 555-44-33')).toBeInTheDocument()
    await userEvent.click(screen.getByText('+7 999 555-44-33'))

    expect(await screen.findAllByText('Ответ')).toHaveLength(2)
  })

  it('shows the reconnecting indicator when receiving fails', async () => {
    server.use(http.get(methodUrl('receiveNotification'), () => HttpResponse.error()))
    renderPage()

    expect(await screen.findByText('Переподключение')).toBeInTheDocument()
  })

  it('explains a settings problem when the server answers 400', async () => {
    server.use(
      http.get(methodUrl('receiveNotification'), () => new HttpResponse(null, { status: 400 })),
    )
    renderPage()

    expect(await screen.findByText(/очистите webhookUrl/)).toBeInTheDocument()
  })

  it('lists chats with the most recent activity first', () => {
    const message = (idMessage: string, timestamp: number) => ({
      id: idMessage,
      idMessage,
      text: idMessage,
      timestamp,
      direction: 'in' as const,
      status: 'sent' as const,
    })
    const store = useChatStore.getState()
    store.addChat({ id: '1', phone: '79990000001' })
    store.addChat({ id: '2', phone: '79990000002' })
    store.addChat({ id: '3', phone: '79990000003' })
    store.addMessage('1', message('late', 3000))
    store.addMessage('2', message('early', 1000))
    renderPage()

    const titles = screen
      .getAllByRole('button')
      .map((button) => button.textContent ?? '')
      .filter((text) => text.includes('+7 999'))

    expect(titles[0]).toContain('+7 999 000-00-03')
    expect(titles[1]).toContain('+7 999 000-00-01')
    expect(titles[2]).toContain('+7 999 000-00-02')
  })

  it('clears the session and the chats on logout', async () => {
    useChatStore.getState().addChat({ id: '10000000', phone: '79991234567' })
    renderPage()

    await userEvent.click(screen.getByRole('button', { name: 'Выйти' }))

    expect(useSessionStore.getState().credentials).toBeNull()
    expect(useChatStore.getState().chats).toEqual([])
  })
})
