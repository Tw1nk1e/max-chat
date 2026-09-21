import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button, Input, Spinner } from '../../../shared/ui'
import { useCreateChat } from '../model/useCreateChat'
import styles from './NewChatForm.module.css'

type NewChatFormProps = {
  onCreated: () => void
}

function NewChatForm({ onCreated }: NewChatFormProps) {
  const { createChat, status, error } = useCreateChat()
  const [phone, setPhone] = useState('')

  const isPending = status === 'pending'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const created = await createChat(phone)
    if (created) {
      setPhone('')
      onCreated()
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Input
        label="Номер телефона"
        name="phone"
        type="tel"
        autoComplete="off"
        placeholder="+7 999 123-45-67"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        error={error ?? undefined}
      />
      <Button type="submit" disabled={isPending || !phone.trim()}>
        {isPending ? <Spinner label="Проверяем номер" /> : 'Создать чат'}
      </Button>
    </form>
  )
}

export default NewChatForm
