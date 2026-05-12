import ArticleCard from "./ArticleCard";
import "./ArticlesSection.css";

export default function ArticlesSection() {
  const articles = [
    {
      id: 1,
      image: "/src/assets/articles/article-1.png",
      badge: "Безкоштовно",
      title: "Думки HR: Як правильно шукати робітників?",
      description:
        "В цій статті ви дізнаєтесь про способи знаходити робітників, правильного інтерв’ю та про процеси онбордингу від HR з компанії OBC.",
      primaryAction: "Прочитати",
      secondaryAction: "Зберегти на потім",
    },
    {
      id: 2,
      image: "/src/assets/articles/article-2.png",
      badge: "Доступно до 11.01.26",
      title: "Конфлікти в команді та компанії",
      description:
        "В цій статті ви дізнаєтесь про способи уникнення та вирішення конфліктів в команді, з керівником або клієнтом.",
      primaryAction: "Прочитати",
      secondaryAction: "Зберегти на потім",
    },
    {
      id: 3,
      image: "/src/assets/articles/article-3.png",
      badge: "Знижка -10%",
      title: "Як правильно влаштовувати комунікацію в команді?",
      description:
        "Збірник статей для менеджерів та керівників відділів та компаній з прикладами та лекціями від професіоналів.",
      primaryAction: "Придбати",
      secondaryAction: "Зберегти на потім",
    },
  ];

  return (
    <section className="articles-section">
      <h2 className="articles-title">Найкращі Пропозиції</h2>

      <div className="articles-inner">
        <div className="articles-grid">
          {articles.map((article) => (
            <ArticleCard key={article.id} data={article} />
          ))}
        </div>
      </div>
    </section>
  );
}
