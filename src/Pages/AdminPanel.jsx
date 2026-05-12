import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "/src/assets/images/Mini-logo.svg";
import placeholderThumb from "../assets/images/Banner-background.png";
import AdminUserManagement from "../components/admin/AdminUserManagement";
import { useAuth } from "../context/AuthContext";
import { apiDelete, apiGet, apiPatch, apiPost } from "../api/client";
import "./AdminPanel.css";

function resolveArticleThumb(raw) {
  if (raw == null || raw === "" || raw === "placeholder") return placeholderThumb;
  return raw;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(new Error("Не вдалося прочитати файл"));
    fr.readAsDataURL(file);
  });
}

export default function AdminPanel() {
  const { logout, user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const fileInputId = useId();
  const editFileInputId = useId();
  const fileRef = useRef(null);
  const editFileRef = useRef(null);
  const [articles, setArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [articlesError, setArticlesError] = useState(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);

  const [editingArticleId, setEditingArticleId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editPreviewUrl, setEditPreviewUrl] = useState(null);
  const [editPendingImageUrl, setEditPendingImageUrl] = useState(null);

  const loadArticles = useCallback(async () => {
    setArticlesLoading(true);
    setArticlesError(null);
    try {
      const data = await apiGet("/admin/articles");
      setArticles(Array.isArray(data.articles) ? data.articles : []);
    } catch (e) {
      setArticlesError(e?.message || "Не вдалося завантажити статті");
      setArticles([]);
    } finally {
      setArticlesLoading(false);
    }
  }, []);

  const onPickImage = useCallback(() => {
    fileRef.current?.click();
  }, []);

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
  };

  const revokeIfBlob = (url) => {
    if (url && String(url).startsWith("blob:")) URL.revokeObjectURL(url);
  };

  const addArticle = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const file = fileRef.current?.files?.[0];
    let image = "placeholder";
    if (file) {
      try {
        image = await fileToDataUrl(file);
      } catch (e) {
        alert(e?.message || "Помилка зображення");
        return;
      }
    }
    try {
      await apiPost("/admin/articles", { title: trimmed, body: body.trim(), image });
      setTitle("");
      setBody("");
      setPreviewUrl((prev) => {
        revokeIfBlob(prev);
        return null;
      });
      if (fileRef.current) fileRef.current.value = "";
      await loadArticles();
    } catch (e) {
      alert(e?.message || "Не вдалося створити статтю");
    }
  };

  const closeArticleEditor = (opts = { discardPending: true }) => {
    if (opts.discardPending) {
      revokeIfBlob(editPendingImageUrl);
    }
    setEditPendingImageUrl(null);
    setEditingArticleId(null);
    setEditTitle("");
    setEditBody("");
    setEditPreviewUrl(null);
    if (editFileRef.current) editFileRef.current.value = "";
  };

  const openArticleEditor = (article) => {
    closeArticleEditor();
    setEditingArticleId(article.id);
    setEditTitle(article.title);
    setEditBody(article.body ?? "");
    setEditPreviewUrl(resolveArticleThumb(article.image));
  };

  const onEditFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    revokeIfBlob(editPendingImageUrl);
    const url = URL.createObjectURL(file);
    setEditPendingImageUrl(url);
    setEditPreviewUrl(url);
  };

  const saveArticleEdit = async (e) => {
    e.preventDefault();
    const trimmed = editTitle.trim();
    if (!trimmed || !editingArticleId) return;
    const file = editFileRef.current?.files?.[0];
    const payload = { title: trimmed, body: editBody.trim() };
    if (file) {
      try {
        payload.image = await fileToDataUrl(file);
      } catch (err) {
        alert(err?.message || "Помилка зображення");
        return;
      }
    }
    try {
      await apiPatch(`/admin/articles/${editingArticleId}`, payload);
      await loadArticles();
      closeArticleEditor({ discardPending: true });
    } catch (err) {
      alert(err?.message || "Не вдалося зберегти зміни");
    }
  };

  const removeArticle = async (id, articleTitle) => {
    const ok = window.confirm(
      `Видалити статтю «${articleTitle}»?\n\nЦю дію не можна скасувати.`
    );
    if (!ok) return;
    try {
      await apiDelete(`/admin/articles/${id}`);
      if (editingArticleId === id) closeArticleEditor({ discardPending: true });
      await loadArticles();
    } catch (e) {
      alert(e?.message || "Не вдалося видалити статтю");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const roleLabel =
    user?.role === "superadmin" ? "Супер-адмін" : user?.role === "admin" ? "Адмін" : "Користувач";

  return (
    <div className="admin-panel">
      <header className="admin-panel__top">
        <Link to="/" className="admin-panel__logo" aria-label="На головну">
          <img src={logo} alt="OBC" />
        </Link>
        <div className="admin-panel__center">
          <h1 className="admin-panel__title">Admin - panel</h1>
          <div className="admin-panel__toolbar">
            {user ? (
              <span className="admin-panel__role-badge" title="Ваша роль у системі">
                {roleLabel}: {user.email}
              </span>
            ) : null}
            <Link to="/" className="admin-panel__nav-link">
              На сайт
            </Link>
            <a href="#admin-users" className="admin-panel__nav-link">
              До користувачів
            </a>
          </div>
        </div>
        <button type="button" className="admin-panel__logout" onClick={handleLogout}>
          Вийти
        </button>
      </header>

      <div className="admin-panel__main">
        <AdminUserManagement />

        <section className="admin-panel__section" aria-labelledby="admin-articles-heading">
          <h2 id="admin-articles-heading" className="admin-panel__section-title">
            Список статей
          </h2>
          <div className="admin-panel__card admin-panel__card--scroll">
            {articlesError ? (
              <p className="admin-panel__articles-msg" role="alert">
                {articlesError}{" "}
                <button type="button" className="admin-article-card__link" onClick={() => loadArticles()}>
                  Спробувати знову
                </button>
              </p>
            ) : null}
            {articlesLoading ? (
              <p className="admin-panel__articles-msg">Завантаження статей…</p>
            ) : (
              <div className="admin-panel__grid">
                {articles.map((article) => (
                  <article key={article.id} className="admin-article-card">
                    <div className="admin-article-card__thumb">
                      <img src={resolveArticleThumb(article.image)} alt="" />
                    </div>
                    <h3 className="admin-article-card__name">{article.title}</h3>
                    <div className="admin-article-card__actions">
                      <button
                        type="button"
                        className="admin-article-card__link"
                        onClick={() => openArticleEditor(article)}
                      >
                        Змінити
                      </button>
                      <button
                        type="button"
                        className="admin-article-card__link"
                        onClick={() => removeArticle(article.id, article.title)}
                      >
                        Видалити
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="admin-panel__section" aria-labelledby="admin-constructor-heading">
          <h2 id="admin-constructor-heading" className="admin-panel__section-title">
            Конструктор статті
          </h2>
          <div className="admin-panel__card admin-panel__card--constructor">
            <div className="admin-constructor__row">
              <input
                ref={fileRef}
                id={fileInputId}
                type="file"
                accept="image/*"
                className="admin-constructor__file-input"
                onChange={onFileChange}
              />
              <button type="button" className="admin-constructor__upload" onClick={onPickImage}>
                {previewUrl ? (
                  <img src={previewUrl} alt="" className="admin-constructor__upload-preview" />
                ) : (
                  <span className="admin-constructor__upload-placeholder">Загрузити картинку</span>
                )}
              </button>
              <input
                type="text"
                className="admin-constructor__title-input"
                placeholder="Вставити назву"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-label="Назва статті"
              />
            </div>
            <textarea
              className="admin-constructor__body"
              placeholder="Вставити текст"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              aria-label="Текст статті"
            />
          </div>
          <div className="admin-panel__actions">
            <button type="button" className="admin-panel__primary" onClick={addArticle}>
              Додати
            </button>
          </div>
        </section>
      </div>

      {editingArticleId != null ? (
        <div className="admin-users__modal-overlay" role="presentation" onClick={() => closeArticleEditor()}>
          <div
            className="admin-users__modal admin-article-edit-modal"
            role="dialog"
            aria-labelledby="admin-article-edit-title"
            onClick={(ev) => ev.stopPropagation()}
          >
            <h3 id="admin-article-edit-title" className="admin-users__subhead">
              Редагувати статтю
            </h3>
            <form className="admin-users__form" onSubmit={saveArticleEdit}>
              <input
                ref={editFileRef}
                id={editFileInputId}
                type="file"
                accept="image/*"
                className="admin-constructor__file-input"
                onChange={onEditFileChange}
              />
              <div className="admin-article-edit-modal__thumb-row">
                <button type="button" className="admin-constructor__upload" onClick={() => editFileRef.current?.click()}>
                  {editPreviewUrl ? (
                    <img src={editPreviewUrl} alt="" className="admin-constructor__upload-preview" />
                  ) : (
                    <span className="admin-constructor__upload-placeholder">Змінити картинку</span>
                  )}
                </button>
              </div>
              <label className="admin-article-edit-modal__label">
                Назва
                <input
                  className="admin-article-edit-modal__input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </label>
              <label className="admin-article-edit-modal__label">
                Текст
                <textarea
                  className="admin-article-edit-modal__textarea"
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  rows={8}
                />
              </label>
              <div className="admin-users__modal-actions">
                <button type="button" className="admin-users__btn-secondary" onClick={() => closeArticleEditor()}>
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
    </div>
  );
}
