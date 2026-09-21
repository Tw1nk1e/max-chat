import { useId, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { Button } from '../../../shared/ui'
import styles from './MessageInput.module.css'

type MessageInputProps = {
  onSend: (text: string) => boolean
}

function MessageInput({ onSend }: MessageInputProps) {
  const inputId = useId()
  const [text, setText] = useState('')

  function submit() {
    if (onSend(text)) {
      setText('')
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    submit()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.visuallyHidden} htmlFor={inputId}>
        Сообщение
      </label>
      <textarea
        id={inputId}
        className={styles.textarea}
        placeholder="Напишите сообщение"
        rows={1}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Button type="submit" disabled={!text.trim()}>
        Отправить
      </Button>
    </form>
  )
}

export default MessageInput
