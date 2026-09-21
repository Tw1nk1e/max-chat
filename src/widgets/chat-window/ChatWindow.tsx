import { useEffect, useRef } from 'react'
import type { ReactNode, UIEvent } from 'react'
import { Avatar } from '../../shared/ui'
import styles from './ChatWindow.module.css'

type ChatWindowMessage = {
  id: string
  text: string
  time: string
  direction: 'in' | 'out'
  status: 'pending' | 'sent' | 'error'
}

type ChatWindowProps = {
  phone: string | null
  messages: ChatWindowMessage[]
  composer: ReactNode
  onBack: () => void
  onRetryMessage: (messageId: string) => void
}

const STICK_TO_BOTTOM_THRESHOLD = 80

function ChatWindow({ phone, messages, composer, onBack, onRetryMessage }: ChatWindowProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const stickToBottom = useRef(true)
  const lastMessage = messages.at(-1)

  useEffect(() => {
    stickToBottom.current = true
  }, [phone])

  useEffect(() => {
    const list = listRef.current
    if (list && (stickToBottom.current || lastMessage?.direction === 'out')) {
      list.scrollTop = list.scrollHeight
    }
  }, [phone, messages.length, lastMessage?.id, lastMessage?.direction])

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    const { scrollHeight, scrollTop, clientHeight } = event.currentTarget
    stickToBottom.current = scrollHeight - scrollTop - clientHeight < STICK_TO_BOTTOM_THRESHOLD
  }

  if (!phone) {
    return (
      <div className={styles.emptyChat}>
        <p>Выберите чат или создайте новый</p>
      </div>
    )
  }

  return (
    <div className={styles.window}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.back}
          onClick={onBack}
          aria-label="Назад к списку чатов"
        >
          ←
        </button>
        <Avatar label={phone.slice(-2)} />
        <h2 className={styles.phone}>{phone}</h2>
      </header>
      <div
        ref={listRef}
        className={styles.messages}
        role="log"
        aria-live="polite"
        aria-label="Сообщения"
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <p className={styles.emptyMessages}>Сообщений пока нет</p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={message.direction === 'out' ? styles.bubbleOut : styles.bubbleIn}
              data-status={message.status}
            >
              <span className={styles.visuallyHidden}>
                {message.direction === 'out' ? 'Вы: ' : 'Собеседник: '}
              </span>
              <p className={styles.bubbleText}>{message.text}</p>
              <span className={styles.bubbleMeta}>
                {message.status === 'error' ? (
                  <>
                    <span>Не отправлено</span>
                    <button
                      type="button"
                      className={styles.retry}
                      onClick={() => onRetryMessage(message.id)}
                    >
                      Повторить
                    </button>
                  </>
                ) : null}
                <span>{message.status === 'pending' ? 'Отправка...' : message.time}</span>
              </span>
            </div>
          ))
        )}
      </div>
      {composer}
    </div>
  )
}

export default ChatWindow
export type { ChatWindowMessage, ChatWindowProps }
