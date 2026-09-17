import { useId } from 'react'
import type { FormEvent } from 'react'
import { Avatar, Button } from '../../shared/ui'
import styles from './ChatWindow.module.css'

type ChatWindowMessage = {
  id: string
  text: string
  time: string
  direction: 'in' | 'out'
}

type ChatWindowProps = {
  phone: string | null
  messages: ChatWindowMessage[]
  onBack: () => void
}

function ChatWindow({ phone, messages, onBack }: ChatWindowProps) {
  const inputId = useId()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
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
            >
              <p className={styles.bubbleText}>{message.text}</p>
              <span className={styles.bubbleTime}>{message.time}</span>
            </div>
          ))
        )}
      </div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.visuallyHidden} htmlFor={inputId}>
          Сообщение
        </label>
        <textarea
          id={inputId}
          className={styles.textarea}
          placeholder="Напишите сообщение"
          rows={1}
        />
        <Button type="submit">Отправить</Button>
      </form>
    </div>
  )
}

export default ChatWindow
export type { ChatWindowMessage, ChatWindowProps }
