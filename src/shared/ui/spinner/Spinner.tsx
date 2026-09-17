import styles from './Spinner.module.css'

type SpinnerProps = {
  label?: string
}

function Spinner({ label = 'Загрузка' }: SpinnerProps) {
  return (
    <span className={styles.spinner} role="status" aria-label={label}>
      <span className={styles.circle} />
    </span>
  )
}

export default Spinner
export type { SpinnerProps }
