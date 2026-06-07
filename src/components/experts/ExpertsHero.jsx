import "./ExpertsHero.css";
import background from "../../assets/images/Banner-background.png";

export default function ExpertsHero() {
  return (
    <section
      className="experts-hero"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="experts-hero-inner">
        <div className="experts-hero-card">
          <h1>Знайдіть свого ідеального консультанта</h1>

          <p>
            Наші експерти — це не теоретики, а практикуючі фахівці з
            багаторічним досвідом в українських та міжнародних компаніях.
            Вони готові допомогти вам уникнути помилок та знайти найкращі
            рішення для вашого бізнесу.
          </p>
        </div>
      </div>
    </section>
  );
}
