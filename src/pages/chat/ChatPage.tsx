import { useState } from 'react'
import { ChatList } from '../../widgets/chat-list'
import type { ChatListItem } from '../../widgets/chat-list'
import { ChatWindow } from '../../widgets/chat-window'
import type { ChatWindowMessage } from '../../widgets/chat-window'
import styles from './ChatPage.module.css'

const mockChats: ChatListItem[] = [
  { id: '1', phone: '+7 999 123-45-67', lastMessage: 'Привет! Как дела?', time: '14:32' },
  { id: '2', phone: '+7 912 555-11-22', lastMessage: 'Отправил документы', time: 'Вчера' },
]

const mockMessages: Record<string, ChatWindowMessage[]> = {
  '1': [
    { id: 'm1', text: 'Привет!', time: '14:20', direction: 'out' },
    { id: 'm2', text: 'Привет! Как дела?', time: '14:32', direction: 'in' },
  ],
  '2': [],
}

function ChatPage() {
  const [activeChatId, setActiveChatId] = useState<string | null>(mockChats[0].id)

  const activeChat = mockChats.find((chat) => chat.id === activeChatId) ?? null
  const messages = activeChatId ? mockMessages[activeChatId] : []

  return (
    <div className={styles.layout} data-chat-active={activeChat ? 'true' : 'false'}>
      <aside className={styles.sidebar}>
        <ChatList
          chats={mockChats}
          activeChatId={activeChatId}
          onSelectChat={setActiveChatId}
          onNewChat={() => {}}
          connectionStatus="online"
        />
      </aside>
      <main className={styles.main}>
        <ChatWindow
          phone={activeChat?.phone ?? null}
          messages={messages}
          onBack={() => setActiveChatId(null)}
        />
      </main>
    </div>
  )
}

export default ChatPage
