import "./Knowledge.css";

export default function Search() {
  return (
    <section className="knowledge-search">
      <h2 className="knowledge-search-title">
        Пошук за категоріями
      </h2>

      <div className="knowledge-search-input">
        <input
          type="text"
          placeholder="Яку проблему хочете вирішити?"
        />
      </div>
    </section>
  );
}
