import styles from './Avatar.module.css'

type AvatarProps = {
  label: string
}

function Avatar({ label }: AvatarProps) {
  return (
    <div className={styles.avatar} aria-hidden="true">
      {label}
    </div>
  )
}

export default Avatar
export type { AvatarProps }
