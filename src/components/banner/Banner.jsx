import "./Banner.css";
import background from "/src/assets/images/Banner-background.png";

export default function Banner() {
  return (
    <section className="banner" style={{ backgroundImage: `url(${background})` }}>
      <div className="banner-container">
        <h1>Доступні консультації для вашого бізнесу</h1>
        <div className="search-container">
          <input type="text" placeholder="Чим ми можемо допомогти?" />
        </div>
      </div>
    </section>
  );
}
