# GREEN-API клиент (MAX)

Заметки по документации https://green-api.com/v3/docs/, актуальные для мессенджера MAX (`typeInstance: v3`).

## Хост и формат запроса

`apiUrl` уникален для каждого инстанса (например `https://3100.api.green-api.com`), общего дефолта нет: значение видно в личном кабинете. Шаблон запроса одинаковый для всех методов:

```
{{apiUrl}}/waInstance{{idInstance}}/{{method}}/{{apiTokenInstance}}
```

Префикс `/v3/` необязателен. Заголовок `Content-Type: application/json` нужен для запросов с телом.

## Идентификатор чата (chatId)

Единого способа "собрать chatId из номера" нет: сервер сам присваивает идентификатор чата, а `phoneNumber@c.us` - это обратная совместимость, а не основной формат.

- Личный чат: `chatId` - строка с цифрами, например `"10000000"`.
- Групповой чат: начинается с `-`, например `"-10000000000000"`.
- Отправка по номеру телефона (`{{phoneNumber}}@c.us`) поддерживается, но **только для кодов стран 7 (РФ) и 375 (РБ)**. После такой отправки сервер сам назначит настоящий `chatId`, и он придёт во входящем уведомлении в поле `senderData.chatId`, которое может отличаться от `{{phoneNumber}}@c.us`.
- Официальная рекомендация GREEN-API: сначала вызвать `CheckAccount` по номеру телефона, получить `chatId`, и дальше использовать именно его для отправки и сопоставления с входящими сообщениями.

Принятое решение: чат создаётся через `CheckAccount`, дальше везде используется полученный `chatId`.

## Проверка номера (CheckAccount)

```
POST {{apiUrl}}/waInstance{{idInstance}}/checkAccount/{{apiTokenInstance}}
Content-Type: application/json

{ "phoneNumber": 79991234567 }
```

- `phoneNumber` - число, 11 или 12 цифр, поддерживаются только коды 7 (РФ) и 375 (РБ).
- Ответ: `{ "exist": true, "chatId": "10000000", "fromCache": false }`. Если аккаунта нет - `exist: false` и пустой `chatId`.
- Если инстанс не авторизован или достигнут лимит проверок, ответ приходит с кодом 200 в виде `{ "status": false, "reason": "..." }`. Клиент превращает это в `ApiError`.
- Слишком частые проверки разных номеров дают HTTP 469, номер лучше не проверять повторно без необходимости: мессенджер может наложить ограничения на аккаунт.
- На тарифе Developer доступно 100 проверок номеров.

## Отправка сообщения (SendMessage)

```
POST {{apiUrl}}/waInstance{{idInstance}}/sendMessage/{{apiTokenInstance}}
Content-Type: application/json

{ "chatId": "10000000", "message": "текст" }
```

Ответ: `{ "idMessage": "1763115112345" }`. Максимальная длина сообщения 4000 символов, кодировка UTF-8 без BOM.

## Получение уведомлений через HTTP API

Работает как очередь: получил → обработал → удалил. Формат из очереди сохраняется 24 часа, порядок FIFO.

### ReceiveNotification

```
GET {{apiUrl}}/waInstance{{idInstance}}/receiveNotification/{{apiTokenInstance}}?receiveTimeout={{seconds}}
```

- `receiveTimeout`: от 5 до 60 секунд, по умолчанию 5. Это long polling: запрос "висит" до появления уведомления или до истечения таймаута.
- Если уведомлений нет - тело ответа пустое (не JSON `null`, а пустая строка).
- Если есть - `{ "receiptId": 1234567, "body": { ...уведомление... } }`.

### DeleteNotification

```
DELETE {{apiUrl}}/waInstance{{idInstance}}/deleteNotification/{{apiTokenInstance}}/{{receiptId}}
```

Ответ: `{ "result": true, "reason": "" }`. Вызывать всегда после обработки уведомления, даже если тип нам не интересен, иначе очередь встанет.

### Структура уведомления (body)

```json
{
  "typeWebhook": "incomingMessageReceived",
  "instanceData": { "idInstance": 3100000000, "wid": "79991234567@c.us", "typeInstance": "v3" },
  "timestamp": 1763115112,
  "idMessage": "1763115112345",
  "senderData": {
    "chatId": "10000000",
    "chatName": "Имя",
    "chatType": "user",
    "sender": "10000000",
    "senderName": "Имя",
    "senderPhoneNumber": 79876543210
  },
  "messageData": {
    "typeMessage": "textMessage",
    "textMessageData": { "textMessage": "текст сообщения" }
  }
}
```

Чат: `body.senderData.chatId`. Текст входящего сообщения: `body.messageData.textMessageData.textMessage`, но только когда `body.messageData.typeMessage === "textMessage"` (другие типы игнорируем через type guard).

### Какие typeWebhook нам интересны

- `incomingMessageReceived` - обязательно, это входящие сообщения от собеседника.
- `outgoingMessageReceived` - сообщение, отправленное с телефона/веб/десктоп клиента MAX (не через наш веб-чат). Формат `messageData` идентичен входящему. Полезно, чтобы сообщения, отправленные напрямую в приложении MAX, тоже появлялись в нашем чате.
- `outgoingAPIMessageReceived` - эхо сообщения, отправленного через API (в том числе нами через `sendMessage`). Нужна дедупликация по `idMessage`, чтобы не задвоить оптимистично добавленное сообщение.
- `outgoingMessageStatus`, `stateInstanceChanged`, `quotaExceeded` - не обрабатываем в MVP, уведомление всё равно нужно удалить методом `DeleteNotification`.

### Настройки инстанса, чтобы уведомления приходили в очередь HTTP API

Через `SetSettings` (или в личном кабинете):

```json
{
  "webhookUrl": "",
  "incomingWebhook": "yes",
  "outgoingMessageWebhook": "yes",
  "outgoingAPIMessageWebhook": "yes"
}
```

`webhookUrl` обязательно пустой - иначе `ReceiveNotification` вернёт ошибку 400 и попросит очистить `webhookUrl` в личном кабинете. `outgoingWebhook` (статусы отправленных сообщений) не включаем - статусы прочтения/доставки вне ТЗ.

## GetStateInstance

```
GET {{apiUrl}}/waInstance{{idInstance}}/getStateInstance/{{apiTokenInstance}}
```

Ответ: `{ "stateInstance": "authorized" }`. Значения: `notAuthorized`, `authorized`, `blocked`, `starting`, `suspended`, `pendingPassword`. Используем при входе, чтобы проверить, что инстанс авторизован.

## Ограничение частоты запросов

Лимиты в запросах в секунду на инстанс: `SendMessage` - 50, `ReceiveNotification`/`DeleteNotification` - 100, `GetStateInstance` - 1. При превышении - HTTP 429.

## Ошибки

Общие HTTP-ошибки (см. "Стандартные ошибки" в доке):

| Код     | Причина                            | Текст для UI                                       |
| ------- | ---------------------------------- | -------------------------------------------------- |
| 401     | неверный `apiTokenInstance`        | "Неверный apiTokenInstance"                        |
| 403     | неверный `idInstance` или `apiUrl` | "Неверный idInstance или адрес apiUrl"             |
| 429     | превышен лимит запросов в секунду  | "Слишком много запросов, попробуйте позже"         |
| 400     | ошибка валидации запроса           | "Некорректный запрос к GREEN-API"                  |
| 469     | слишком частые проверки номеров    | "Слишком много проверок номеров, попробуйте позже" |
| 500/502 | сбой на стороне GREEN-API          | "GREEN-API временно недоступен"                    |
| сеть    | `fetch` не смог выполнить запрос   | "Нет соединения с сетью"                           |

Всё это оборачивается в класс `ApiError` (`status` + готовый текст для UI).
