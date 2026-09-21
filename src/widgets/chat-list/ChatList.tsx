import { Avatar, Button, PlusIcon } from '../../shared/ui'
import styles from './ChatList.module.css'

type ChatListItem = {
  id: string
  phone: string
  lastMessage: string
  time: string
}

type ConnectionStatus = 'online' | 'reconnecting'

type ChatListProps = {
  chats: ChatListItem[]
  activeChatId: string | null
  onSelectChat: (id: string) => void
  onNewChat: () => void
  onLogout: () => void
  connectionStatus: ConnectionStatus
  connectionError?: string | null
}

function ChatList({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onLogout,
  connectionStatus,
  connectionError,
}: ChatListProps) {
  return (
    <div className={styles.list}>
      <div className={styles.header}>
        <h1 className={styles.title}>MAX Chat</h1>
        <button
          type="button"
          className={styles.addButton}
          onClick={onNewChat}
          aria-label="Новый чат"
        >
          <PlusIcon />
        </button>
      </div>
      <div className={styles.status} role="status">
        <span
          className={connectionStatus === 'online' ? styles.dotOnline : styles.dotReconnecting}
          aria-hidden="true"
        />
        {connectionStatus === 'online' ? 'В сети' : 'Переподключение'}
      </div>
      {connectionError ? <p className={styles.connectionError}>{connectionError}</p> : null}
      {chats.length === 0 ? (
        <p className={styles.empty}>Чатов пока нет</p>
      ) : (
        <ul className={styles.items}>
          {chats.map((chat) => (
            <li key={chat.id}>
              <button
                type="button"
                className={chat.id === activeChatId ? styles.itemActive : styles.item}
                aria-current={chat.id === activeChatId ? 'true' : undefined}
                onClick={() => onSelectChat(chat.id)}
              >
                <Avatar label={chat.phone.slice(-2)} />
                <span className={styles.itemBody}>
                  <span className={styles.itemPhone}>{chat.phone}</span>
                  <span className={styles.itemMessage}>{chat.lastMessage}</span>
                </span>
                <span className={styles.itemTime}>{chat.time}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className={styles.footer}>
        <Button variant="ghost" onClick={onLogout}>
          Выйти
        </Button>
      </div>
    </div>
  )
}

export default ChatList
export type { ChatListItem, ChatListProps, ConnectionStatus }
