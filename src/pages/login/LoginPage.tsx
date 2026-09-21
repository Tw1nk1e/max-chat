import { LoginForm } from '../../features/auth'
import styles from './LoginPage.module.css'

function LoginPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>MAX Chat</h1>
        <p className={styles.subtitle}>Введите данные вашего инстанса GREEN-API</p>
        <LoginForm />
      </div>
    </div>
  )
}

export default LoginPage
