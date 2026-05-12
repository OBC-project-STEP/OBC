import "./Knowledge.css";
import bannerBg from "../../assets/images/Banner-background.png";

export default function Hero() {
  return (
    <section
      className="knowledge-hero"
      style={{ backgroundImage: `url(${bannerBg})` }}
    >
      <div className="knowledge-hero-inner">
        <div className="knowledge-hero-card">
          <h1 className="knowledge-hero-title">
            Ваш центр бізнес-знань
          </h1>

          <p className="knowledge-hero-text">
            Тут зібрані практичні статті, готові шаблони, інструкції та кейси
            від провідних експертів. Ми не пишемо про абстрактну теорію —
            лише про те, що працює на українському ринку тут і зараз.
          </p>
        </div>
      </div>
    </section>
  );
}
