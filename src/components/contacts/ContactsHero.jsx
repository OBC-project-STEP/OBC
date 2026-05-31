import firstIcon from "../../assets/contact icons/first.png";

export default function ContactsHero() {
  return (
    <section className="contacts-hero">
      <div className="contacts-hero-icon">
        <img src={firstIcon} alt="Support" />
      </div>

      <div className="contacts-hero-content">
        <h1>Завжди на звʼязку</h1>
        <p>
          Маєте питання, пропозиції або просто хочете сказати "привіт"?
          Оберіть зручний для вас спосіб звʼязку.
        </p>
      </div>
    </section>
  );
}
