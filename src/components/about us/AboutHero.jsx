import "./AboutUs.css";
import strategyImg from "../../assets/about us pictures/Strategy.png";

export default function AboutHero() {
  return (
    <section className="about-hero">
      <div className="about-hero-inner">
        <div className="about-hero-card">
          <div className="about-hero-text">
            <h1>Наша місія — зробити експертну підтримку доступною</h1>

            <p>
              Ми віримо, що кожен підприємець в Україні заслуговує на швидку,
              якісну та доступну допомогу.
            </p>

            <p>
              Платформа OBC народилася з простої проблеми, знайомої кожному, хто
              починав свою справу: де знайти відповідь на термінове питання?
              Консалтингові агентства — це дорого і довго. Інформація в інтернеті
              — суперечлива та часто застаріла. А час, витрачений на пошуки, —
              це втрачені гроші та можливості.
            </p>

            <p>
              Ми вирішили це змінити. Ми створили єдиний простір, де підприємець
              може закрити будь-яке своє питання: від реєстрації ФОП до побудови
              маркетингової стратегії та вирішення конфліктів у команді.
            </p>
          </div>

          <div className="about-hero-image">
            <img src={strategyImg} alt="Strategy" />
          </div>
        </div>
      </div>
    </section>
  );
}
