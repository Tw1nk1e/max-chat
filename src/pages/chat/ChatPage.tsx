import { useState } from 'react'
import { useChatStore } from '../../entities/chat'
import { useLogout } from '../../features/auth'
import { NewChatForm } from '../../features/create-chat'
import { MessageInput, useSendMessage } from '../../features/send-message'
import { formatPhone, formatTime } from '../../shared/lib'
import { ChatList } from '../../widgets/chat-list'
import { ChatWindow } from '../../widgets/chat-window'
import styles from './ChatPage.module.css'

function ChatPage() {
  const chats = useChatStore((state) => state.chats)
  const activeChatId = useChatStore((state) => state.activeChatId)
  const selectChat = useChatStore((state) => state.selectChat)
  const { send, retry } = useSendMessage()
  const logout = useLogout()
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)

  const activeChat = chats.find((chat) => chat.id === activeChatId) ?? null

  const listItems = chats.map((chat) => {
    const lastMessage = chat.messages.at(-1)
    return {
      id: chat.id,
      phone: formatPhone(chat.phone),
      lastMessage: lastMessage?.text ?? '',
      time: lastMessage ? formatTime(lastMessage.timestamp) : '',
    }
  })

  const windowMessages = (activeChat?.messages ?? []).map((message) => ({
    id: message.id,
    text: message.text,
    time: formatTime(message.timestamp),
    direction: message.direction,
    status: message.status,
  }))

  return (
    <div className={styles.layout} data-chat-active={activeChat ? 'true' : 'false'}>
      <aside className={styles.sidebar}>
        <ChatList
          chats={listItems}
          activeChatId={activeChatId}
          onSelectChat={selectChat}
          onNewChat={() => setIsNewChatOpen((isOpen) => !isOpen)}
          onLogout={logout}
          newChatForm={
            isNewChatOpen ? <NewChatForm onCreated={() => setIsNewChatOpen(false)} /> : null
          }
          connectionStatus="online"
        />
      </aside>
      <main className={styles.main}>
        <ChatWindow
          phone={activeChat ? formatPhone(activeChat.phone) : null}
          messages={windowMessages}
          composer={
            activeChat ? (
              <MessageInput key={activeChat.id} onSend={(text) => send(activeChat.id, text)} />
            ) : null
          }
          onBack={() => selectChat(null)}
          onRetryMessage={(messageId) => activeChat && retry(activeChat.id, messageId)}
        />
      </main>
    </div>
  )
}

export default ChatPage
