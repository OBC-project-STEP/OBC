import "./Knowledge.css";

export default function Categories() {
  const categories = [
    {
      title: "Маркетинг та продажі:",
      text:
        "Як залучити перших клієнтів, побудувати воронку та збільшити продажі.",
    },
    {
      title: "Фінанси та податки:",
      text:
        "Все про ФОП, ТОВ, звітність, оптимізацію та фінансове планування.",
    },
    {
      title: "Команда та HR:",
      text:
        "Де шукати співробітників, як проводити співбесіди та керувати командою.",
    },
  ];

  return (
    <section className="knowledge-categories">
      <div className="knowledge-categories-inner">
        {categories.map((item, index) => (
          <div key={index} className="knowledge-category-card">
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
