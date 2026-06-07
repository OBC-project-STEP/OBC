import { useCallback, useEffect, useState } from "react";
import { apiDelete, apiGet, apiPatch, apiPost } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

const emptyCreate = {
  email: "",
  password: "",
  password_confirm: "",
  surname: "",
  name: "",
  phone: "",
  role: "user",
};

const emptyEdit = {
  surname: "",
  name: "",
  phone: "",
  role: "user",
  password: "",
  password_confirm: "",
};

export default function AdminUserManagement() {
  const { user: viewer, refreshUser } = useAuth();
  const viewerRole = String(viewer?.role || "user").toLowerCase();
  const isSuper = viewerRole === "superadmin";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [createForm, setCreateForm] = useState(emptyCreate);
  const [editingId, setEditingId] = useState(null);
  const [editingIsSuper, setEditingIsSuper] = useState(false);
  const [editForm, setEditForm] = useState(emptyEdit);

  const loadUsers = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const data = await apiGet("/admin/users");
      setUsers(data.users || []);
    } catch (e) {
      setError(e.message || "Не вдалося завантажити список");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const openEdit = (u) => {
    setEditingId(u.id);
    setEditingIsSuper(String(u.role || "").toLowerCase() === "superadmin");
    setEditForm({
      surname: u.surname || "",
      name: u.name || "",
      phone: u.phone || "",
      role: u.role === "admin" ? "admin" : "user",
      password: "",
      password_confirm: "",
    });
    setSuccess("");
    setError("");
  };

  const closeEdit = () => {
    setEditingId(null);
    setEditingIsSuper(false);
    setEditForm(emptyEdit);
  };

  const onCreateSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const payload = {
        email: createForm.email.trim(),
        password: createForm.password,
        password_confirm: createForm.password_confirm,
        surname: createForm.surname.trim(),
        name: createForm.name.trim(),
        phone: createForm.phone.trim() || null,
        role: isSuper ? createForm.role : "user",
      };
      await apiPost("/admin/users", payload);
      setCreateForm(emptyCreate);
      setSuccess("Користувача створено.");
      await loadUsers();
      await refreshUser();
    } catch (e) {
      setError(e.message || "Помилка створення");
    }
  };

  const onEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    setError("");
    setSuccess("");
    try {
      const payload = {
        surname: editForm.surname.trim(),
        name: editForm.name.trim(),
        phone: editForm.phone.trim() || null,
      };
      if (isSuper && !editingIsSuper) {
        payload.role = editForm.role;
      }
      if (editForm.password) {
        payload.password = editForm.password;
        payload.password_confirm = editForm.password_confirm;
      }
      await apiPatch(`/admin/users/${editingId}`, payload);
      setSuccess("Зміни збережено.");
      closeEdit();
      await loadUsers();
      await refreshUser();
    } catch (e) {
      setError(e.message || "Помилка збереження");
    }
  };

  const onDelete = async (u) => {
    if (!window.confirm(`Видалити користувача ${u.email}?`)) return;
    setError("");
    setSuccess("");
    try {
      await apiDelete(`/admin/users/${u.id}`);
      setSuccess("Користувача видалено.");
      if (editingId === u.id) closeEdit();
      await loadUsers();
      await refreshUser();
    } catch (e) {
      setError(e.message || "Не вдалося видалити");
    }
  };

  const roleLabel = (r) => {
    const x = String(r || "").toLowerCase();
    if (x === "superadmin") return "Супер-адмін";
    if (x === "admin") return "Адмін";
    return "Користувач";
  };

  return (
    <section id="admin-users" className="admin-users" aria-labelledby="admin-users-heading">
      <h2 id="admin-users-heading" className="admin-panel__section-title">
        Користувачі — додати та змінити
      </h2>

      {error ? (
        <div className="admin-users__alert admin-users__alert--err" role="alert">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="admin-users__alert admin-users__alert--ok" role="status">
          {success}
        </div>
      ) : null}

      <div className="admin-panel__card admin-users__card">
        <h3 className="admin-users__subhead">Новий користувач</h3>
        <form className="admin-users__form" onSubmit={onCreateSubmit}>
          <div className="admin-users__grid">
            <label>
              Email
              <input
                type="email"
                required
                value={createForm.email}
                onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
              />
            </label>
            <label>
              Пароль
              <input
                type="password"
                required
                minLength={6}
                value={createForm.password}
                onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
              />
            </label>
            <label>
              Повтор пароля
              <input
                type="password"
                required
                minLength={6}
                value={createForm.password_confirm}
                onChange={(e) => setCreateForm((f) => ({ ...f, password_confirm: e.target.value }))}
              />
            </label>
            <label>
              Прізвище
              <input
                required
                value={createForm.surname}
                onChange={(e) => setCreateForm((f) => ({ ...f, surname: e.target.value }))}
              />
            </label>
            <label>
              Ім&apos;я
              <input
                required
                value={createForm.name}
                onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
              />
            </label>
            <label>
              Телефон
              <input
                value={createForm.phone}
                onChange={(e) => setCreateForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </label>
            {isSuper ? (
              <label>
                Роль
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value }))}
                >
                  <option value="user">Користувач</option>
                  <option value="admin">Адмін</option>
                </select>
              </label>
            ) : null}
          </div>
          <button type="submit" className="admin-panel__primary admin-users__btn">
            Створити
          </button>
        </form>
      </div>

      <div className="admin-panel__card admin-users__card admin-users__card--table">
        <h3 className="admin-users__subhead">Список</h3>
        {loading ? (
          <p className="admin-users__muted">Завантаження…</p>
        ) : (
          <div className="admin-users__table-wrap">
            <table className="admin-users__table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Ім&apos;я</th>
                  <th>Прізвище</th>
                  <th>Телефон</th>
                  <th>Роль</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="admin-users__muted" style={{ textAlign: "center" }}>
                      Немає записів. Створіть користувача формою вище.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.email}</td>
                      <td>{u.name}</td>
                      <td>{u.surname}</td>
                      <td>{u.phone || "—"}</td>
                      <td>{roleLabel(u.role)}</td>
                      <td className="admin-users__actions">
                        <button type="button" className="admin-article-card__link" onClick={() => openEdit(u)}>
                          Змінити
                        </button>
                        <button type="button" className="admin-article-card__link" onClick={() => onDelete(u)}>
                          Видалити
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingId != null ? (
        <div className="admin-users__modal-overlay" role="presentation" onClick={closeEdit}>
          <div
            className="admin-users__modal"
            role="dialog"
            aria-labelledby="admin-edit-user-title"
            onClick={(ev) => ev.stopPropagation()}
          >
            <h3 id="admin-edit-user-title" className="admin-users__subhead">
              Редагування #{editingId}
            </h3>
            <form className="admin-users__form" onSubmit={onEditSubmit}>
              <div className="admin-users__grid">
                <label>
                  Прізвище
                  <input
                    required
                    value={editForm.surname}
                    onChange={(e) => setEditForm((f) => ({ ...f, surname: e.target.value }))}
                  />
                </label>
                <label>
                  Ім&apos;я
                  <input
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </label>
                <label>
                  Телефон
                  <input
                    value={editForm.phone}
                    onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </label>
                {isSuper && !editingIsSuper ? (
                  <label>
                    Роль
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                    >
                      <option value="user">Користувач</option>
                      <option value="admin">Адмін</option>
                    </select>
                  </label>
                ) : null}
                {isSuper && editingIsSuper ? (
                  <p className="admin-users__muted">Роль супер-адміна не змінюється через панель.</p>
                ) : null}
                <label>
                  Новий пароль (необов.)
                  <input
                    type="password"
                    minLength={6}
                    value={editForm.password}
                    onChange={(e) => setEditForm((f) => ({ ...f, password: e.target.value }))}
                    autoComplete="new-password"
                  />
                </label>
                <label>
                  Повтор пароля
                  <input
                    type="password"
                    minLength={6}
                    value={editForm.password_confirm}
                    onChange={(e) => setEditForm((f) => ({ ...f, password_confirm: e.target.value }))}
                  />
                </label>
              </div>
              <div className="admin-users__modal-actions">
                <button type="button" className="admin-users__btn-secondary" onClick={closeEdit}>
                  Скасувати
                </button>
                <button type="submit" className="admin-panel__primary admin-users__btn">
                  Зберегти
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
