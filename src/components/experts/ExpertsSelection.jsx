import "./ExpertsSelection.css";

export default function ExpertsSelection() {
  return (
    <section className="experts-selection">
      <div className="experts-selection-inner">
        <h2 className="experts-selection-title">
          Як ми відбираємо експертів?
        </h2>

        <p className="experts-selection-subtitle">
          Ми гарантуємо якість кожної консультації. Кожен експерт на платформі
          проходить 3 етапи відбору:
        </p>

        <div className="experts-selection-cards">
          <div className="experts-selection-card">
            <h3>Перевірка досвіду та кваліфікації:</h3>
            <p>
              Ми аналізуємо резюме, кейси та рекомендації.
            </p>
          </div>

          <div className="experts-selection-card">
            <h3>Тестова консультація:</h3>
            <p>
              Кандидат проводить симуляцію консультації з нашими фахівцями.
            </p>
          </div>

          <div className="experts-selection-card">
            <h3>Система рейтингів та відгуків:</h3>
            <p>
              Тільки експерти з високими оцінками від клієнтів
              залишаються на платформі.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
