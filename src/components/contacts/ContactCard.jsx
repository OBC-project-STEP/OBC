import "./Contacts.css";

export default function ContactCard({ icon, title, text, extra }) {
  return (
    <div className="contact-card">
      <div className="contact-card-icon">
        <img src={icon} alt="" />
      </div>

      <div className="contact-card-center">
        <h2>{title}</h2>
        <p className="contact-card-text">{text}</p>

        {extra && <p className="contact-card-extra">{extra}</p>}
      </div>
    </div>
  );
}
