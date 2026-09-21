import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button, Input, Spinner } from '../../../shared/ui'
import { useLogin } from '../model/useLogin'
import styles from './LoginForm.module.css'

function LoginForm() {
  const { login, status, error } = useLogin()
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [apiUrl, setApiUrl] = useState('')

  const isPending = status === 'pending'

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void login({
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
      apiUrl: apiUrl.trim(),
    })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Input
        label="idInstance"
        name="idInstance"
        autoComplete="off"
        required
        value={idInstance}
        onChange={(event) => setIdInstance(event.target.value)}
      />
      <Input
        label="apiTokenInstance"
        name="apiTokenInstance"
        type="password"
        autoComplete="off"
        required
        value={apiTokenInstance}
        onChange={(event) => setApiTokenInstance(event.target.value)}
      />
      <Input
        label="apiUrl"
        name="apiUrl"
        type="url"
        autoComplete="off"
        placeholder="https://3100.api.green-api.com"
        required
        value={apiUrl}
        onChange={(event) => setApiUrl(event.target.value)}
      />
      {error ? (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? <Spinner label="Проверяем инстанс" /> : 'Войти'}
      </Button>
    </form>
  )
}

export default LoginForm
