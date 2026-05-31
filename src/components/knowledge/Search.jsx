import "./Knowledge.css";

export default function Search({ searchQuery = "", onSearchChange }) {
  return (
    <section className="knowledge-search">
      <h2 className="knowledge-search-title">
        Пошук за категоріями
      </h2>

      <div className="knowledge-search-input">
        <input
          type="search"
          placeholder="Яку проблему хочете вирішити?"
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          aria-label="Пошук статей"
        />
      </div>
    </section>
  );
}
