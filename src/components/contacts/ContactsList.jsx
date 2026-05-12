import ContactCard from "./ContactCard";
import "./Contacts.css";

import first from "../../assets/contact icons/first.png";
import second from "../../assets/contact icons/second.png";
import third from "../../assets/contact icons/third.png";
import fourth from "../../assets/contact icons/fourth.png";

export default function ContactsList() {
  return (
    <section className="contacts-list">
      <ContactCard icon={first} title="Клієнтська підтримка">
        <p>
          Якщо у вас виникли технічні питання або проблеми з використанням сервісу,
          наш ШІ-помічник у чаті доступний 24/7.
        </p>
        <p>Email: support@obc.platform</p>
        <p>Пн–Пт, 9:00–18:00</p>
      </ContactCard>

      <ContactCard icon={second} title="Партнерство та співпраця">
        <p>
          Якщо ви представляєте бізнес-школу, банк або маєте пропозицію співпраці —
          напишіть нам.
        </p>
        <p>Email: partners@obc.platform</p>
      </ContactCard>

      <ContactCard icon={third} title="Для експертів">
        <p>
          Бажаєте приєднатися до платформи як експерт?
          Надішліть резюме та мотиваційний лист.
        </p>
        <p>Email: experts@obc.platform</p>
      </ContactCard>

      <ContactCard icon={fourth} title="Ми в соціальних мережах">
        <p>Слідкуйте за нами та пишіть у соцмережах</p>
      </ContactCard>
    </section>
  );
}
