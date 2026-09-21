import type { InstanceState } from '../../../shared/api'

function stateInstanceMessage(stateInstance: InstanceState): string {
  switch (stateInstance) {
    case 'notAuthorized':
      return 'Инстанс не авторизован, отсканируйте QR-код в личном кабинете GREEN-API'
    case 'blocked':
      return 'Аккаунт MAX заблокирован'
    case 'starting':
      return 'Инстанс запускается, попробуйте через пару минут'
    case 'suspended':
      return 'На аккаунте временные ограничения GREEN-API'
    case 'pendingPassword':
      return 'Требуется ввести пароль двухфакторной аутентификации в личном кабинете GREEN-API'
    default:
      return 'Инстанс недоступен'
  }
}

export { stateInstanceMessage }
