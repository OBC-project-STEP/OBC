# OBC Auth API (FastAPI + SQLite)

## Запуск

З каталогу `backend`:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Файл бази `obc_users.db` створюється автоматично поруч із `main.py`.

Паролі зберігаються як **SHA-256** з унікальною **сіллю** на користувача (див. `db.py`).

## Змінні середовища (опційно, файл `.env`)

| Змінна | Значення за замовчуванням |
|--------|---------------------------|
| `JWT_SECRET` | (слабкий ключ для dev — змініть у prod) |
| `FRONTEND_URL` | `http://localhost:5173` — посилання в листі відновлення |
| `DATABASE_PATH` | `obc_users.db` |
| `SMTP_HOST` | порожньо — лист не відправляється, **посилання друкується в консоль** сервера |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | логін SMTP |
| `SMTP_PASSWORD` | пароль SMTP |
| `SMTP_FROM` | адреса «від кого» |

Якщо SMTP не налаштовано, після кроку «Відновити доступ» подивіться **лог uvicorn** — там буде повне посилання з токеном.

## Код відновлення (костиль)

На кроці введення коду з email приймається лише **`1111`**.

## Ролі

- **`superadmin`** — один обліковий запис (bootstrap). Бачить усіх, створює **адмінів** і **користувачів**, редагує всіх (роль супер-адміна не міняється через API), не можна видалити.
- **`admin`** — бачить лише **`user`**, створює й редагує лише **користувачів**, може видаляти лише **`user`**.
- **`user`** — звичайний акаунт; панель `/admin` недоступна.

Після старту сервера, якщо ще **немає** жодного `superadmin`, створюється акаунт з email/паролем з налаштувань (див. нижче).

## Bootstrap супер-адміна

У `.env` (або змінні середовища):

| Змінна | За замовчуванням (dev) |
|--------|-------------------------|
| `BOOTSTRAP_SUPERADMIN_EMAIL` | `superadmin@example.com` |
| `BOOTSTRAP_SUPERADMIN_PASSWORD` | `superadmin123` |

Якщо користувач з цим email уже існує і **немає** супер-адміна — йому підвищують роль і **оновлюють пароль** на значення з `BOOTSTRAP_SUPERADMIN_PASSWORD`. У production змініть пароль та email.

Адреси на кшталт `*@*.local` **не приймаються** валідатором email (Pydantic). Якщо у вашій БД супер-адмін ще з `superadmin@obc.local`, змініть email у SQLite, наприклад:  
`UPDATE users SET email = 'superadmin@example.com' WHERE role = 'superadmin';`  
або задайте у `.env` валідний `BOOTSTRAP_SUPERADMIN_EMAIL` і оновіть запис відповідно.

## Ендпоінти

- `POST /auth/register` — реєстрація (email, пароль ×2, прізвище, ім’я, телефон опційно)
- `POST /auth/login`
- `GET /auth/me` — Bearer access token
- `PATCH /auth/me` — оновити ім’я, прізвище, телефон (Bearer)
- `GET /admin/users` — список (admin: лише `user`; superadmin: усі)
- `POST /admin/users` — створити (admin: лише `user`; superadmin: `admin` | `user`)
- `PATCH /admin/users/{id}` — змінити профіль / роль / пароль (згідно прав)
- `DELETE /admin/users/{id}` — видалити (обмеження за роллю)
- `POST /auth/forgot-password` — лист / лог з посиланням
- `POST /auth/verify-recovery-code` — email + код `1111` → `reset_token` (JWT)
- `POST /auth/reset-password` — Bearer `reset_token`, новий пароль ×2
- `POST /auth/reset-password-with-link` — тіло `{ token, password, password_confirm }` з посилання з email
