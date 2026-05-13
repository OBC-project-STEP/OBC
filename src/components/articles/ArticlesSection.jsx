import ArticlesCarousel from "./ArticlesCarousel";
import { homeArticles } from "../../data/homeArticles";
import "./ArticlesSection.css";

export default function ArticlesSection() {
  return (
    <section className="articles-section">
      <h2 className="articles-title">Найкращі Пропозиції</h2>

      <div className="articles-inner">
        <ArticlesCarousel articles={homeArticles} />
      </div>
    </section>
  );
}
