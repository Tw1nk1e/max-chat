import { Avatar, Button } from '../../shared/ui'
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
}

function ChatList({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onLogout,
  connectionStatus,
}: ChatListProps) {
  return (
    <div className={styles.list}>
      <div className={styles.header}>
        <h1 className={styles.title}>MAX Chat</h1>
        <Button variant="secondary" onClick={onNewChat}>
          Новый чат
        </Button>
      </div>
      <div className={styles.status}>
        <span
          className={connectionStatus === 'online' ? styles.dotOnline : styles.dotReconnecting}
        />
        {connectionStatus === 'online' ? 'В сети' : 'Переподключение'}
      </div>
      {chats.length === 0 ? (
        <p className={styles.empty}>Чатов пока нет</p>
      ) : (
        <ul className={styles.items}>
          {chats.map((chat) => (
            <li key={chat.id}>
              <button
                type="button"
                className={chat.id === activeChatId ? styles.itemActive : styles.item}
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
