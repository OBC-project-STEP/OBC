import hashlib
import logging
import secrets
import sqlite3
from contextlib import contextmanager
from pathlib import Path

from settings import settings

logger = logging.getLogger(__name__)


def _connect():
    path = Path(__file__).resolve().parent / settings.database_path
    conn = sqlite3.connect(path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


@contextmanager
def get_db():
    conn = _connect()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def _migrate_users_role(conn: sqlite3.Connection) -> None:
    cols = [r[1] for r in conn.execute("PRAGMA table_info(users)").fetchall()]
    if "role" not in cols:
        conn.execute("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'")


def _migrate_fix_null_roles(conn: sqlite3.Connection) -> None:
    """Якщо role NULL — дати коректне значення (інакше API вважає user і /admin недоступний)."""
    be = (settings.bootstrap_superadmin_email or "").strip().lower()
    if be:
        conn.execute(
            """
            UPDATE users SET role = 'superadmin'
            WHERE lower(email) = lower(?) AND (role IS NULL OR trim(role) = '')
            """,
            (be,),
        )
    conn.execute(
        """
        UPDATE users SET role = 'user'
        WHERE role IS NULL OR trim(role) = ''
        """
    )


def _migrate_legacy_superadmin_email(conn: sqlite3.Connection) -> None:
    """Pydantic EmailStr не приймає .local — переносимо старий bootstrap email."""
    row = conn.execute(
        "SELECT id FROM users WHERE lower(email) = lower(?)",
        ("superadmin@obc.local",),
    ).fetchone()
    if not row:
        return
    other = conn.execute(
        """
        SELECT id FROM users
        WHERE lower(email) = lower(?) AND id != ?
        """,
        ("superadmin@example.com", row["id"]),
    ).fetchone()
    if other:
        logger.warning(
            "Не оновлено superadmin@obc.local: вже є користувач superadmin@example.com. "
            "Змініть email вручну в БД."
        )
        return
    try:
        conn.execute(
            "UPDATE users SET email = ? WHERE id = ?",
            ("superadmin@example.com", row["id"]),
        )
        logger.info("Email superadmin оновлено: obc.local → example.com")
    except sqlite3.IntegrityError:
        logger.warning("Не вдалося оновити email superadmin@obc.local (конфлікт).")


def init_db():
    with get_db() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                password_hash TEXT NOT NULL,
                salt TEXT NOT NULL,
                surname TEXT NOT NULL,
                name TEXT NOT NULL,
                phone TEXT,
                role TEXT NOT NULL DEFAULT 'user',
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS password_resets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                token_hash TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                used INTEGER NOT NULL DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );

            CREATE INDEX IF NOT EXISTS idx_password_resets_token
            ON password_resets(token_hash);
            """
        )
        _migrate_users_role(conn)
        _migrate_fix_null_roles(conn)
        _migrate_legacy_superadmin_email(conn)
        _ensure_articles_table(conn)
        _seed_demo_articles_if_empty(conn)


def _ensure_articles_table(conn: sqlite3.Connection) -> None:
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS articles (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            body TEXT NOT NULL DEFAULT '',
            image TEXT NOT NULL DEFAULT 'placeholder',
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
        """
    )


def _seed_demo_articles_if_empty(conn: sqlite3.Connection) -> None:
    n = conn.execute("SELECT COUNT(*) AS c FROM articles").fetchone()["c"]
    if n > 0:
        return
    title = "Думки HR: Як правильно шукати робітників?"
    for i in range(8):
        aid = str(i + 1)
        mod = f"-{8 - i} seconds"
        conn.execute(
            """
            INSERT INTO articles (id, title, body, image, created_at)
            VALUES (?, ?, '', 'placeholder', datetime('now', ?))
            """,
            (aid, title, mod),
        )
    logger.info("Створено демо-статті в articles (8 шт.)")


def hash_password(password: str, salt: str | None = None) -> tuple[str, str]:
    if salt is None:
        salt = secrets.token_hex(16)
    digest = hashlib.sha256(f"{salt}:{password}".encode("utf-8")).hexdigest()
    return digest, salt


def verify_password(password: str, salt: str, password_hash: str) -> bool:
    h, _ = hash_password(password, salt)
    return secrets.compare_digest(h, password_hash)


def hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def seed_bootstrap_superadmin() -> None:
    """Один супер-адмін з .env; якщо вже є superadmin — нічого не робить."""
    with get_db() as conn:
        n = conn.execute(
            "SELECT COUNT(*) AS c FROM users WHERE role = 'superadmin'"
        ).fetchone()["c"]
        if n > 0:
            return

        email = (settings.bootstrap_superadmin_email or "").strip().lower()
        pwd = settings.bootstrap_superadmin_password or ""
        if not email or not pwd:
            logger.warning(
                "Немає жодного супер-адміна. Задайте BOOTSTRAP_SUPERADMIN_EMAIL та "
                "BOOTSTRAP_SUPERADMIN_PASSWORD у .env (або змінні середовища)."
            )
            return

        row = conn.execute(
            "SELECT id, role FROM users WHERE lower(email) = lower(?)",
            (email,),
        ).fetchone()
        phash, salt = hash_password(pwd)
        if row:
            conn.execute(
                "UPDATE users SET role = 'superadmin', password_hash = ?, salt = ? WHERE id = ?",
                (phash, salt, row["id"]),
            )
            logger.info("Користувача %s підвищено до superadmin (bootstrap).", email)
            return

        try:
            conn.execute(
                """
                INSERT INTO users (email, password_hash, salt, surname, name, phone, role)
                VALUES (?, ?, ?, 'Адмін', 'Супер', NULL, 'superadmin')
                """,
                (email, phash, salt),
            )
            logger.info("Створено bootstrap superadmin: %s", email)
        except sqlite3.IntegrityError:
            logger.exception("Не вдалося створити bootstrap superadmin")
