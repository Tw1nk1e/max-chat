import type { ReactNode } from 'react'
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

function ChatWindow({ phone, messages, composer, onBack, onRetryMessage }: ChatWindowProps) {
  if (!phone) {
    return (
      <div className={styles.emptyChat}>
        <p>Выберите чат или создайте новый</p>
      </div>
    )
  }

  return (
    <div className={styles.window}>
      <div className={styles.header}>
        <button
          type="button"
          className={styles.back}
          onClick={onBack}
          aria-label="Назад к списку чатов"
        >
          ←
        </button>
        <Avatar label={phone.slice(-2)} />
        <span className={styles.phone}>{phone}</span>
      </div>
      <div className={styles.messages} role="log" aria-live="polite">
        {messages.length === 0 ? (
          <p className={styles.emptyMessages}>Сообщений пока нет</p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={message.direction === 'out' ? styles.bubbleOut : styles.bubbleIn}
              data-status={message.status}
            >
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
