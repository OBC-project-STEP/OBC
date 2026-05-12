import logging
import secrets
import sqlite3
import uuid
from datetime import datetime, timedelta, timezone
from typing import Annotated, Literal

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr, Field
from starlette.requests import Request

from db import get_db, hash_password, hash_token, init_db, seed_bootstrap_superadmin, verify_password
from mailer import send_password_reset_email
from settings import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="OBC Auth API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup():
    init_db()
    seed_bootstrap_superadmin()


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


# --- Pydantic ---


class RegisterBody(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    password_confirm: str = Field(min_length=6)
    surname: str = Field(min_length=1, max_length=200)
    name: str = Field(min_length=1, max_length=200)
    phone: str | None = Field(default=None, max_length=50)


class LoginBody(BaseModel):
    email: EmailStr
    password: str


class ForgotBody(BaseModel):
    email: EmailStr


class VerifyCodeBody(BaseModel):
    email: EmailStr
    code: str


class ResetPasswordJwtBody(BaseModel):
    password: str = Field(min_length=6)
    password_confirm: str = Field(min_length=6)


class ResetPasswordTokenBody(BaseModel):
    token: str
    password: str = Field(min_length=6)
    password_confirm: str = Field(min_length=6)


class ProfileUpdateBody(BaseModel):
    surname: str = Field(min_length=1, max_length=200)
    name: str = Field(min_length=1, max_length=200)
    phone: str | None = Field(default=None, max_length=50)


class AdminCreateUserBody(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    password_confirm: str = Field(min_length=6)
    surname: str = Field(min_length=1, max_length=200)
    name: str = Field(min_length=1, max_length=200)
    phone: str | None = Field(default=None, max_length=50)
    role: Literal["admin", "user"] = "user"


class AdminUpdateUserBody(BaseModel):
    surname: str = Field(min_length=1, max_length=200)
    name: str = Field(min_length=1, max_length=200)
    phone: str | None = Field(default=None, max_length=50)
    role: Literal["admin", "user"] | None = None
    password: str | None = None
    password_confirm: str | None = None


class ArticleCreateBody(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    body: str = Field(default="", max_length=200_000)
    image: str = Field(default="placeholder", max_length=15_000_000)


class ArticleUpdateBody(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=500)
    body: str | None = Field(default=None, max_length=200_000)
    image: str | None = Field(default=None, max_length=15_000_000)


# --- JWT ---


def create_access_token(email: str) -> str:
    expire = utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    return jwt.encode(
        {"sub": email.lower(), "typ": "access", "exp": expire},
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )


def create_password_reset_jwt(email: str) -> str:
    expire = utcnow() + timedelta(minutes=settings.password_reset_expire_minutes)
    return jwt.encode(
        {"sub": email.lower(), "typ": "password_reset", "exp": expire},
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )


def decode_token(token: str) -> dict:
    return jwt.decode(
        token,
        settings.jwt_secret,
        algorithms=[settings.jwt_algorithm],
    )


def bearer_token(request: Request) -> str | None:
    h = request.headers.get("authorization") or request.headers.get("Authorization")
    if not h or not h.lower().startswith("bearer "):
        return None
    return h.split(" ", 1)[1].strip()


def get_current_user(request: Request) -> dict:
    token = bearer_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="Не авторизовано")
    try:
        payload = decode_token(token)
        if payload.get("typ") != "access":
            raise HTTPException(status_code=401, detail="Невірний токен")
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Невірний токен")
    except JWTError:
        raise HTTPException(status_code=401, detail="Невірний або прострочений токен")

    with get_db() as conn:
        row = conn.execute(
            "SELECT id, email, surname, name, phone, role FROM users WHERE lower(email) = lower(?)",
            (email,),
        ).fetchone()
    if not row:
        raise HTTPException(status_code=401, detail="Користувача не знайдено")
    u = dict(row)
    u["role"] = u.get("role") or "user"
    return u


CurrentUser = Annotated[dict, Depends(get_current_user)]


def require_staff(current_user: dict = Depends(get_current_user)) -> dict:
    role = current_user.get("role") or "user"
    if role not in ("superadmin", "admin"):
        raise HTTPException(status_code=403, detail="Потрібні права адміністратора")
    return current_user


StaffUser = Annotated[dict, Depends(require_staff)]


# --- Routes ---


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/auth/register")
def register(body: RegisterBody):
    if body.password != body.password_confirm:
        raise HTTPException(status_code=400, detail="Паролі не збігаються")

    phash, salt = hash_password(body.password)
    email = body.email.lower()
    phone = (body.phone or "").strip() or None

    with get_db() as conn:
        try:
            conn.execute(
                """
                INSERT INTO users (email, password_hash, salt, surname, name, phone, role)
                VALUES (?, ?, ?, ?, ?, ?, 'user')
                """,
                (
                    email,
                    phash,
                    salt,
                    body.surname.strip(),
                    body.name.strip(),
                    phone,
                ),
            )
        except sqlite3.IntegrityError as e:
            if "email" in str(e).lower() or "unique" in str(e).lower():
                raise HTTPException(status_code=400, detail="Цей email вже зареєстровано") from e
            raise

    token = create_access_token(email)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "email": email,
            "surname": body.surname.strip(),
            "name": body.name.strip(),
            "phone": phone,
            "role": "user",
        },
    }


@app.post("/auth/login")
def login(body: LoginBody):
    email = body.email.lower()
    with get_db() as conn:
        row = conn.execute(
            "SELECT id, email, password_hash, salt, surname, name, phone, role FROM users WHERE lower(email) = lower(?)",
            (email,),
        ).fetchone()

    if not row or not verify_password(body.password, row["salt"], row["password_hash"]):
        raise HTTPException(status_code=401, detail="Невірний email або пароль")

    token = create_access_token(row["email"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "email": row["email"],
            "surname": row["surname"],
            "name": row["name"],
            "phone": row["phone"],
            "role": row["role"] or "user",
        },
    }


@app.get("/auth/me")
def me(user: CurrentUser):
    return {"user": user}


@app.patch("/auth/me")
def update_me(body: ProfileUpdateBody, current: CurrentUser):
    email = current["email"]
    phone = (body.phone or "").strip() or None
    with get_db() as conn:
        conn.execute(
            """
            UPDATE users
            SET surname = ?, name = ?, phone = ?
            WHERE lower(email) = lower(?)
            """,
            (body.surname.strip(), body.name.strip(), phone, email),
        )
        row = conn.execute(
            "SELECT id, email, surname, name, phone, role FROM users WHERE lower(email) = lower(?)",
            (email,),
        ).fetchone()
    u = dict(row)
    u["role"] = u.get("role") or "user"
    return {"user": u}


@app.post("/auth/forgot-password")
def forgot_password(body: ForgotBody):
    """Завжди 200. Якщо користувач існує — створюємо токен і шлемо лист (або лог у консоль)."""
    email = body.email.lower()
    with get_db() as conn:
        row = conn.execute(
            "SELECT id FROM users WHERE lower(email) = lower(?)",
            (email,),
        ).fetchone()
        if not row:
            return {"detail": "Якщо акаунт існує, на email надіслано інструкції."}

        raw = secrets.token_urlsafe(32)
        th = hash_token(raw)
        expires = (utcnow() + timedelta(hours=1)).isoformat()
        conn.execute(
            "INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
            (row["id"], th, expires),
        )

    link = f"{settings.frontend_url.rstrip('/')}/password-recovery/new?token={raw}"
    try:
        send_password_reset_email(email, link)
    except Exception as e:
        logger.exception("Помилка відправки email: %s", e)
        logger.info("Fallback link для %s: %s", email, link)

    return {"detail": "Якщо акаунт існує, на email надіслано інструкції."}


@app.post("/auth/verify-recovery-code")
def verify_recovery_code(body: VerifyCodeBody):
    """Костиль: код 1111."""
    if body.code.strip() != "1111":
        raise HTTPException(status_code=400, detail="Невірний код")

    email = body.email.lower()
    with get_db() as conn:
        row = conn.execute(
            "SELECT id FROM users WHERE lower(email) = lower(?)",
            (email,),
        ).fetchone()
    if not row:
        raise HTTPException(status_code=400, detail="Невірний код")

    reset_jwt = create_password_reset_jwt(email)
    return {"reset_token": reset_jwt}


@app.post("/auth/reset-password")
def reset_password(body: ResetPasswordJwtBody, request: Request):
    """Після коду 1111 — Bearer reset_token."""
    if body.password != body.password_confirm:
        raise HTTPException(status_code=400, detail="Паролі не збігаються")

    token = bearer_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="Потрібен токен скидання")

    try:
        payload = decode_token(token)
        if payload.get("typ") != "password_reset":
            raise HTTPException(status_code=401, detail="Невірний токен")
        email = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Невірний або прострочений токен") from None

    phash, salt = hash_password(body.password)
    with get_db() as conn:
        conn.execute(
            "UPDATE users SET password_hash = ?, salt = ? WHERE lower(email) = lower(?)",
            (phash, salt, email),
        )
    return {"detail": "Пароль оновлено"}


@app.post("/auth/reset-password-with-link")
def reset_password_with_link(body: ResetPasswordTokenBody):
    """Посилання з email з сирими token у query."""
    if body.password != body.password_confirm:
        raise HTTPException(status_code=400, detail="Паролі не збігаються")

    th = hash_token(body.token.strip())
    with get_db() as conn:
        row = conn.execute(
            """
            SELECT pr.id, pr.user_id, pr.expires_at, u.email
            FROM password_resets pr
            JOIN users u ON u.id = pr.user_id
            WHERE pr.token_hash = ? AND pr.used = 0
            """,
            (th,),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=400, detail="Невірне або прострочене посилання")

        expires = datetime.fromisoformat(row["expires_at"])
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        if expires < utcnow():
            raise HTTPException(status_code=400, detail="Посилання прострочено")

        phash, salt = hash_password(body.password)
        conn.execute(
            "UPDATE users SET password_hash = ?, salt = ? WHERE id = ?",
            (phash, salt, row["user_id"]),
        )
        conn.execute("UPDATE password_resets SET used = 1 WHERE id = ?", (row["id"],))

    return {"detail": "Пароль оновлено"}


def _user_row_public(row: sqlite3.Row) -> dict:
    u = dict(row)
    u["role"] = u.get("role") or "user"
    return u


def _get_user_row_by_id(conn: sqlite3.Connection, user_id: int) -> sqlite3.Row | None:
    return conn.execute(
        """
        SELECT id, email, surname, name, phone, role, created_at
        FROM users WHERE id = ?
        """,
        (user_id,),
    ).fetchone()


def _article_row_public(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "title": row["title"],
        "body": row["body"] or "",
        "image": row["image"] or "placeholder",
        "created_at": row["created_at"],
    }


@app.get("/admin/articles")
def admin_list_articles(staff: StaffUser):
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT id, title, body, image, created_at
            FROM articles
            ORDER BY datetime(created_at) DESC, id DESC
            """
        ).fetchall()
    return {"articles": [_article_row_public(r) for r in rows]}


@app.post("/admin/articles")
def admin_create_article(body: ArticleCreateBody, staff: StaffUser):
    aid = str(uuid.uuid4())
    title = body.title.strip()
    b = (body.body or "").strip()
    img = (body.image or "").strip() or "placeholder"
    with get_db() as conn:
        conn.execute(
            "INSERT INTO articles (id, title, body, image) VALUES (?, ?, ?, ?)",
            (aid, title, b, img),
        )
        row = conn.execute(
            "SELECT id, title, body, image, created_at FROM articles WHERE id = ?",
            (aid,),
        ).fetchone()
    return {"article": _article_row_public(row)}


@app.patch("/admin/articles/{article_id}")
def admin_update_article(article_id: str, body: ArticleUpdateBody, staff: StaffUser):
    with get_db() as conn:
        exists = conn.execute("SELECT id FROM articles WHERE id = ?", (article_id,)).fetchone()
        if not exists:
            raise HTTPException(status_code=404, detail="Статтю не знайдено")

        parts: list[str] = []
        vals: list[str] = []
        if body.title is not None:
            parts.append("title = ?")
            vals.append(body.title.strip())
        if body.body is not None:
            parts.append("body = ?")
            vals.append((body.body or "").strip())
        if body.image is not None:
            parts.append("image = ?")
            vals.append(body.image.strip() or "placeholder")

        if parts:
            vals.append(article_id)
            conn.execute(
                f"UPDATE articles SET {', '.join(parts)} WHERE id = ?",
                vals,
            )

        row = conn.execute(
            "SELECT id, title, body, image, created_at FROM articles WHERE id = ?",
            (article_id,),
        ).fetchone()
    return {"article": _article_row_public(row)}


@app.delete("/admin/articles/{article_id}")
def admin_delete_article(article_id: str, staff: StaffUser):
    with get_db() as conn:
        cur = conn.execute("DELETE FROM articles WHERE id = ?", (article_id,))
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Статтю не знайдено")
    return {"detail": "Статтю видалено"}


@app.get("/admin/users")
def admin_list_users(staff: StaffUser):
    caller_role = staff.get("role") or "user"
    with get_db() as conn:
        if caller_role == "superadmin":
            rows = conn.execute(
                """
                SELECT id, email, surname, name, phone, role, created_at
                FROM users ORDER BY id ASC
                """
            ).fetchall()
        else:
            rows = conn.execute(
                """
                SELECT id, email, surname, name, phone, role, created_at
                FROM users WHERE role = 'user' ORDER BY id ASC
                """
            ).fetchall()
    return {"users": [_user_row_public(r) for r in rows]}


@app.post("/admin/users")
def admin_create_user(body: AdminCreateUserBody, staff: StaffUser):
    if body.password != body.password_confirm:
        raise HTTPException(status_code=400, detail="Паролі не збігаються")

    caller_role = staff.get("role") or "user"
    if caller_role == "superadmin":
        new_role = body.role if body.role in ("admin", "user") else "user"
    elif caller_role == "admin":
        new_role = "user"
    else:
        raise HTTPException(status_code=403, detail="Недостатньо прав")

    email = body.email.lower()
    phone = (body.phone or "").strip() or None
    phash, salt = hash_password(body.password)

    with get_db() as conn:
        try:
            conn.execute(
                """
                INSERT INTO users (email, password_hash, salt, surname, name, phone, role)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    email,
                    phash,
                    salt,
                    body.surname.strip(),
                    body.name.strip(),
                    phone,
                    new_role,
                ),
            )
            row = conn.execute(
                """
                SELECT id, email, surname, name, phone, role, created_at
                FROM users WHERE lower(email) = lower(?)
                """,
                (email,),
            ).fetchone()
        except sqlite3.IntegrityError as e:
            if "email" in str(e).lower() or "unique" in str(e).lower():
                raise HTTPException(status_code=400, detail="Цей email вже зайнятий") from e
            raise

    return {"user": _user_row_public(row)}


@app.patch("/admin/users/{user_id}")
def admin_update_user(user_id: int, body: AdminUpdateUserBody, staff: StaffUser):
    caller = staff
    caller_role = caller.get("role") or "user"
    phone = (body.phone or "").strip() or None

    if body.password or body.password_confirm:
        if not body.password or len(body.password) < 6 or body.password != body.password_confirm:
            raise HTTPException(status_code=400, detail="Паролі не збігаються або закороткий пароль (мін. 6)")

    with get_db() as conn:
        tgt = _get_user_row_by_id(conn, user_id)
        if not tgt:
            raise HTTPException(status_code=404, detail="Користувача не знайдено")

        tgt_role = tgt["role"] or "user"

        if caller_role == "admin":
            if tgt_role != "user":
                raise HTTPException(status_code=403, detail="Можна редагувати лише користувачів (роль user)")
            new_role = "user"
        else:
            if tgt_role == "superadmin":
                new_role = "superadmin"
            else:
                new_role = body.role if body.role is not None else tgt_role
                if new_role not in ("admin", "user"):
                    new_role = tgt_role

        if body.password:
            phash, salt = hash_password(body.password)
            conn.execute(
                """
                UPDATE users
                SET surname = ?, name = ?, phone = ?, role = ?,
                    password_hash = ?, salt = ?
                WHERE id = ?
                """,
                (
                    body.surname.strip(),
                    body.name.strip(),
                    phone,
                    new_role,
                    phash,
                    salt,
                    user_id,
                ),
            )
        else:
            conn.execute(
                """
                UPDATE users
                SET surname = ?, name = ?, phone = ?, role = ?
                WHERE id = ?
                """,
                (body.surname.strip(), body.name.strip(), phone, new_role, user_id),
            )

        row = _get_user_row_by_id(conn, user_id)

    return {"user": _user_row_public(row)}


@app.delete("/admin/users/{user_id}")
def admin_delete_user(user_id: int, staff: StaffUser):
    caller = staff
    if caller.get("id") == user_id:
        raise HTTPException(status_code=400, detail="Не можна видалити власний акаунт")

    with get_db() as conn:
        tgt = _get_user_row_by_id(conn, user_id)
        if not tgt:
            raise HTTPException(status_code=404, detail="Користувача не знайдено")

        tgt_role = tgt["role"] or "user"
        caller_role = caller.get("role") or "user"

        if caller_role == "admin":
            if tgt_role != "user":
                raise HTTPException(status_code=403, detail="Можна видаляти лише користувачів")
        elif caller_role == "superadmin":
            if tgt_role == "superadmin":
                raise HTTPException(status_code=403, detail="Не можна видалити супер-адміна")
        else:
            raise HTTPException(status_code=403, detail="Недостатньо прав")

        conn.execute("DELETE FROM password_resets WHERE user_id = ?", (user_id,))
        conn.execute("DELETE FROM users WHERE id = ?", (user_id,))

    return {"detail": "Користувача видалено"}
