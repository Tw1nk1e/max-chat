import { useState } from 'react'
import type { FormEvent, SyntheticEvent } from 'react'
import { Button, Input, Spinner } from '../../../shared/ui'
import { useLogin } from '../model/useLogin'
import styles from './LoginForm.module.css'

function LoginForm() {
  const { login, status, error } = useLogin()
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [apiUrl, setApiUrl] = useState('')
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [apiUrlError, setApiUrlError] = useState<string | null>(null)

  const isPending = status === 'pending'

  function handleToggleAdvanced(event: SyntheticEvent<HTMLDetailsElement>) {
    setIsAdvancedOpen(event.currentTarget.open)
  }

  function handleApiUrlChange(value: string) {
    setApiUrl(value)
    if (apiUrlError) {
      setApiUrlError(null)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!apiUrl.trim()) {
      setIsAdvancedOpen(true)
      setApiUrlError('Укажите apiUrl из личного кабинета GREEN-API')
      return
    }

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
      <details className={styles.advanced} open={isAdvancedOpen} onToggle={handleToggleAdvanced}>
        <summary>Дополнительно</summary>
        <Input
          label="apiUrl"
          name="apiUrl"
          placeholder="https://3100.api.green-api.com"
          value={apiUrl}
          onChange={(event) => handleApiUrlChange(event.target.value)}
          error={apiUrlError ?? undefined}
        />
      </details>
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
