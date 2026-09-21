import { HttpResponse, delay, http } from 'msw'

type Credentials = {
  apiUrl: string
  idInstance: string
  apiTokenInstance: string
}

function idleReceiveNotification({ apiUrl, idInstance, apiTokenInstance }: Credentials) {
  return http.get(
    `${apiUrl}/waInstance${idInstance}/receiveNotification/${apiTokenInstance}`,
    async () => {
      await delay('infinite')
      return new HttpResponse('')
    },
  )
}

export { idleReceiveNotification }
