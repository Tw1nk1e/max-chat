import type { FormEvent } from 'react'
import { Button, Input } from '../../shared/ui'
import styles from './LoginPage.module.css'

function LoginPage() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
  }

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.title}>MAX Chat</h1>
        <p className={styles.subtitle}>Введите данные вашего инстанса GREEN-API</p>
        <Input label="idInstance" name="idInstance" autoComplete="off" required />
        <Input
          label="apiTokenInstance"
          name="apiTokenInstance"
          type="password"
          autoComplete="off"
          required
        />
        <details className={styles.advanced}>
          <summary>Дополнительно</summary>
          <Input label="apiUrl" name="apiUrl" placeholder="https://api.green-api.com" />
        </details>
        <Button type="submit">Войти</Button>
      </form>
    </div>
  )
}

export default LoginPage
