function formatTime(timestamp: number, now: number = Date.now()): string {
  const date = new Date(timestamp)
  const time = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

  if (date.toDateString() === new Date(now).toDateString()) {
    return time
  }

  const day = date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
  return `${day} ${time}`
}

export { formatTime }
