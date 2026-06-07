import "./WorkSection.css";

export default function WorkSection() {
  const steps = [
    {
      id: 1,
      image: "/src/assets/work/work-1.png",
      title: "Виникає проблема в бізнесі",
      text: "Ви не знаєте як налаштувати процеси в команді? Відчуваєте що економічний склад іде на спад? Не знаєте з чого почати бізнес?",
    },
    {
      id: 2,
      image: "/src/assets/work/work-2.png",
      title: "Ви реєструєтесь на OBC",
      text: "Ви відкриваєте двері знань від різних професій та експертів з досвідом. Отримуєте доступ до професіоналів прямо в чаті та безлічі статей для вивчення.",
    },
    {
      id: 3,
      image: "/src/assets/work/work-3.png",
      title: "Ви більш впевнені та знаєте що робити!",
      text: "Тепер у вас є ваші особисті експерти, знання та найголовніше — впевненість в тому що ви знайдете відповіді від професіоналів на OBC.",
    },
  ];

  return (
    <section className="work-section">
      <div className="work-inner">
        <h2 className="work-title">Як це працює?</h2>

        <div className="work-grid">
          {steps.map((step) => (
            <div key={step.id} className="work-card">
              <img src={step.image} alt={step.title} />
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
