import Layout from "../components/layout/Layout";

import ContactsHero from "../components/contacts/ContactsHero";
import ContactCard from "../components/contacts/ContactCard";
import SocialCard from "../components/contacts/SocialCard";

import firstIcon from "../assets/contact icons/first.png";
import secondIcon from "../assets/contact icons/second.png";
import thirdIcon from "../assets/contact icons/third.png";
import fourthIcon from "../assets/contact icons/fourth.png";

import "../components/contacts/Contacts.css";

export default function Contacts() {
  return (
    <>
      <section className="contacts-page">
        <ContactsHero icon={firstIcon} />

        <ContactCard
          icon={secondIcon}
          title="Клієнтська підтримка"
          text="Якщо у вас виникли технічні питання або проблеми з використанням сервісу, наш ШІ-помічник у чаті доступний 24/7. Для складних запитів пишіть нам на пошту."
          extra="Email: support@obc.platform | Пн–Пт: 9:00–18:00"
        />

        <ContactCard
          icon={thirdIcon}
          title="Партнерство та співпраця"
          text="Якщо ви представляєте бізнес-школу, банк, державну установу або хочете запропонувати інший формат співпраці — зв’яжіться з нашим відділом партнерства."
          extra="Email: partners@obc.platform"
        />

        <ContactCard
          icon={fourthIcon}
          title="Для експертів"
          text="Бажаєте приєднатися до нашої платформи в якості експерта? Надішліть своє резюме та короткий мотиваційний лист."
          extra="Email: experts@obc.platform"
        />

        <SocialCard />
      </section>
    </>
  );
}
