import "./AboutUs.css";
import checklistImg from "../../assets/about us pictures/checklist.png";

export default function AboutPrinciples() {
  return (
    <section className="about-principles">
      <div className="about-principles-inner">
        <div className="about-principles-card">
          <div className="about-principles-image">
            <img src={checklistImg} alt="Checklist" />
          </div>

          <div className="about-principles-text">
            <h2>Наші принципи</h2>

            <p>
              <strong>Доступність:</strong> Ми пропонуємо гнучкі тарифи — від
              безкоштовного доступу до преміум-підписки, щоб кожен міг знайти
              для себе оптимальне рішення.
            </p>

            <p>
              <strong>Технологічність:</strong> Ми використовуємо ШІ для
              персональних рекомендацій та автоматизації, щоб ви отримували
              відповіді миттєво, 24/7.
            </p>

            <p>
              <strong>Експертність:</strong> Ми ретельно відбираємо кожного
              фахівця нашої платформи, щоб ви були впевнені в якості кожної
              консультації.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
