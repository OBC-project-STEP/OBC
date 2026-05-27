import "./Banner.css";
import background from "/src/assets/images/Banner-background.png";

export default function Banner({ searchQuery = "", onSearchChange }) {
  return (
    <section className="banner" style={{ backgroundImage: `url(${background})` }}>
      <div className="banner-container">
        <h1>Доступні консультації для вашого бізнесу</h1>
        <div className="search-container">
          <input
            type="search"
            placeholder="Чим ми можемо допомогти?"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            aria-label="Пошук статей"
          />
        </div>
      </div>
    </section>
  );
}
