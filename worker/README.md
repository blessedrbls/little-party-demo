# Заявки з сайту в Telegram (Cloudflare Worker)

Worker приймає заявку з форми на сайті, перевіряє поля і надсилає повідомлення в Telegram. Безкоштовного тарифу Cloudflare вистачає з запасом.

Токен бота і chat id зберігаються **тільки** в секретах Cloudflare. У коді та в репозиторії їх немає.

## 1. Бот у Telegram

1. Відкрийте [@BotFather](https://t.me/BotFather), надішліть `/newbot`, задайте ім'я. Збережіть токен вигляду `123456789:AA...`. Це `TELEGRAM_TOKEN`.
2. Вирішіть, куди будуть приходити заявки:
   - **в особисті:** напишіть своєму боту будь-що (наприклад, `/start`);
   - **у групу:** створіть групу, додайте туди бота й напишіть у групі будь-що.
3. Відкрийте в браузері `https://api.telegram.org/bot<ТОКЕН>/getUpdates` і знайдіть `"chat":{"id": ...}`. Це `CHAT_ID` (у групи він починається з мінуса).

## 2. Worker через панель Cloudflare (без командного рядка)

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Create Worker** → назва, наприклад `little-party-orders` → **Deploy**.
2. **Edit code** → замініть увесь код на вміст `worker.js` → **Deploy**.
3. **Settings → Variables and Secrets** → **Add**:
   - `TELEGRAM_TOKEN`, тип **Secret**, значення — токен бота;
   - `CHAT_ID`, тип **Secret**, значення — chat id;
   - `ALLOWED_ORIGINS`, тип **Text**, значення — адреса сайту без шляху та слеша в кінці, наприклад `https://blessedrbls.github.io`. Якщо доменів кілька (наприклад, з'явиться свій домен), перелічіть через кому: `https://blessedrbls.github.io,https://littleparty.com.ua`.
4. Скопіюйте адресу воркера вигляду `https://little-party-orders.<ваш-акаунт>.workers.dev`.

### Або через Wrangler

```bash
cd worker
npx wrangler login
npx wrangler secret put TELEGRAM_TOKEN
npx wrangler secret put CHAT_ID
npx wrangler deploy
```

`ALLOWED_ORIGINS` задається в `wrangler.toml`.

## 3. Підключити до сайту

У `script.js` вгорі:

```js
const WORKER_URL = "https://little-party-orders.<ваш-акаунт>.workers.dev";
```

Закомітьте і запуште. Тепер форма надсилає заявку і показує «Дякуємо! Заявка прийнята, ми зв'яжемося з вами». Якщо відправка не вдалася, показуються кнопки Viber і Telegram.

Поки `WORKER_URL` порожній, форма працює в демо-режимі й нічого не надсилає.

## Що перевіряє воркер

- приймає тільки `POST` з доменів з `ALLOWED_ORIGINS` (CORS), решту відхиляє;
- тіло не більше 8 КБ, тільки JSON;
- ім'я, телефон (10–13 цифр), дата, спосіб отримання обов'язкові; адреса обов'язкова для доставки;
- спосіб зв'язку (Подзвонити / Telegram / Viber) — тільки з цього списку;
- довжина кожного поля обмежена; склад набору — до 40 рядків;
- приховане поле-пастка `website`: якщо його заповнив бот, заявка мовчки ігнорується;
- текст для Telegram екранується, тож HTML із форми не спрацює.

CORS захищає від чужих сайтів у браузері, але не від скриптів, які шлють запити напряму. Якщо почнеться спам, увімкніть у Cloudflare **Security → WAF → Rate limiting rules** для адреси воркера (наприклад, 5 запитів на хвилину з однієї IP).

## Перевірка

```bash
curl -i -X POST "https://little-party-orders.<ваш-акаунт>.workers.dev" \
  -H "Origin: https://blessedrbls.github.io" -H "Content-Type: application/json" \
  -d '{"items":["Тест"],"total":"100 грн","name":"Тест","phone":"+380000000000","contact":"Подзвонити","date":"2026-12-01","time":"10:00","delivery":"Самовивіз","address":"","comment":""}'
```

Відповідь `{"ok":true}` і повідомлення в Telegram — усе працює.
