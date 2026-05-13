import thumb1 from "../assets/images/Banner-background.png";
import thumb2 from "../assets/images/bg.jpg";
import thumb3 from "../assets/images/Banner-background.png";
import thumb4 from "../assets/about us pictures/checklist.png";
import thumb5 from "../assets/about us pictures/Strategy.png";

/** Статті для головної (карусель) — slug збігається з articleDetails і маршрутом /article/:slug */
export const homeArticles = [
  {
    id: 1,
    slug: "hr-hiring",
    image: thumb1,
    badge: "Безкоштовно",
    title: "Думки HR: Як правильно шукати робітників?",
    description:
      "В цій статті ви дізнаєтесь про способи знаходити робітників, правильного інтерв’ю та про процеси онбордингу від HR з компанії OBC.",
    primaryAction: "Прочитати",
    primaryHref: "/article/hr-hiring",
    secondaryAction: "Зберегти на потім",
  },
  {
    id: 2,
    slug: "team-conflicts",
    image: thumb2,
    badge: "Доступно до 11.01.26",
    title: "Конфлікти в команді та компанії",
    description:
      "В цій статті ви дізнаєтесь про способи уникнення та вирішення конфліктів в команді, з керівником або клієнтом.",
    primaryAction: "Прочитати",
    primaryHref: "/article/team-conflicts",
    secondaryAction: "Зберегти на потім",
  },
  {
    id: 3,
    slug: "team-communication",
    image: thumb3,
    badge: "Знижка -10%",
    title: "Як правильно влаштовувати комунікацію в команді?",
    description:
      "Збірник статей для менеджерів та керівників відділів та компаній з прикладами та лекціями від професіоналів.",
    primaryAction: "Придбати",
    primaryHref: "/article/team-communication",
    secondaryAction: "Зберегти на потім",
  },
  {
    id: 4,
    slug: "onboarding-14",
    image: thumb4,
    badge: "Безкоштовно",
    title: "Онбординг нових співробітників за 14 днів",
    description:
      "Чеклист для HR і керівників: що підготувати до першого дня, як познайомити з командою та швидко вивести людину на продуктивність.",
    primaryAction: "Прочитати",
    primaryHref: "/article/onboarding-14",
    secondaryAction: "Зберегти на потім",
  },
  {
    id: 5,
    slug: "hiring-growth",
    image: thumb5,
    badge: "Доступно до 01.03.26",
    title: "Стратегія найму в період зростання",
    description:
      "Як масштабувати підбір, не втрачаючи якість кандидатів: метрики воронки, партнерства та внутрішні рекомендації.",
    primaryAction: "Прочитати",
    primaryHref: "/article/hiring-growth",
    secondaryAction: "Зберегти на потім",
  },
  {
    id: 6,
    slug: "soft-skills-interview",
    image: thumb1,
    badge: "Знижка -15%",
    title: "Оцінка soft skills на інтервʼю",
    description:
      "Практичні питання та спостереження, які допомагають передбачити поведінку кандидата в реальних робочих ситуаціях.",
    primaryAction: "Придбати",
    primaryHref: "/article/soft-skills-interview",
    secondaryAction: "Зберегти на потім",
  },
  {
    id: 7,
    slug: "remote-engagement",
    image: thumb2,
    badge: "Безкоштовно",
    title: "Дистанційна команда: правила залучення",
    description:
      "Як тримати залученість людей у віддаленому форматі: ритуали, прозорі цілі та інструменти зворотного звʼязку.",
    primaryAction: "Прочитати",
    primaryHref: "/article/remote-engagement",
    secondaryAction: "Зберегти на потім",
  },
];

/** Знайти статтю за slug (для сторінки /article/:slug) */
export function getHomeArticleBySlug(slug) {
  return homeArticles.find((a) => a.slug === slug) ?? null;
}
