import { useId, useLayoutEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { ArrowUpIcon } from '../../../shared/ui'
import styles from './MessageInput.module.css'

const MAX_MESSAGE_LENGTH = 4000
const MAX_INPUT_HEIGHT = 160

type MessageInputProps = {
  onSend: (text: string) => boolean
}

function MessageInput({ onSend }: MessageInputProps) {
  const inputId = useId()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [text, setText] = useState('')
  const canSend = text.trim().length > 0

  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) {
      return
    }

    textarea.style.height = 'auto'
    const borders = textarea.offsetHeight - textarea.clientHeight
    textarea.style.height = `${Math.min(textarea.scrollHeight + borders, MAX_INPUT_HEIGHT)}px`
  }, [text])

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
        ref={textareaRef}
        id={inputId}
        className={styles.textarea}
        placeholder="Напишите сообщение"
        rows={1}
        maxLength={MAX_MESSAGE_LENGTH}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      {canSend ? (
        <button type="submit" className={styles.send} aria-label="Отправить">
          <ArrowUpIcon size={20} />
        </button>
      ) : null}
    </form>
  )
}

export default MessageInput
