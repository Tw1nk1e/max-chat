import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import styles from './Input.module.css'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

function Input({ label, error, id, className, ...rest }: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const classes = [styles.input, error ? styles.inputError : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      <input id={inputId} className={classes} aria-invalid={Boolean(error)} {...rest} />
      {error ? <span className={styles.error}>{error}</span> : null}
    </div>
  )
}

export default Input
export type { InputProps }
