import { Link } from "react-router-dom";
import "./TermsConditions.css";
import arrowImg from "../../assets/images/Arrow.png";

function Reviews()
{
    return (
        <div className="termsPage">

            <div className="reviewsWrapper">

                <div className="termsContainer">

                    <h1 className="termsTitle">
                        Відгуки
                    </h1>

                    <div className="termsTextBlock">

                        <h2>Олексій М., CEO IT-стартапу</h2>
                        <p>
                            Ми довго відкладали юридичні питання, бо наймати юриста в штат було дорого, а фрілансерам я не довіряв. З OBC ми закрили всі питання за тиждень. Завантажили з бази крутий шаблон NDA для розробників, а потім взяли годинну консультацію з HR-експертом щодо побудови системи бонусів. Максимально ефективно і без "води".
                        </p>

                        <h2>Олена В., Засновниця маркетингової мікроагенції</h2>
                        <p>
                            Коли я переходила з фрілансу до відкриття власної агенції, мене найбільше лякали податки для ФОП і найм людей. Підписка на OBC стала моєю рятувальною паличкою. Я передивилась відеоінструкції, все налаштувала сама, а складне питання щодо валютних рахунків швидко вирішила на дзвінку з фінансовим консультантом платформи.
                        </p>

                        <h2>Дмитро К., Власник інтернет-магазину</h2>
                        <p>
                            Раніше я гуглив договори і молився, щоб вони були правильними. Тепер я просто відкриваю базу знань OBC. Формат "підписка + можливість залучити експерта в один клік" — це те, чого дуже не вистачало малому бізнесу в Україні. Рекомендую!
                        </p>

                    </div>

                </div>

                {/* CTA */}
                <div className="about-cta">

                    <div className="about-cta-inner">

                        <span className="about-cta-text">
                            Долучайся прямо зараз
                        </span>

                        <img
                            src={arrowImg}
                            alt="Arrow"
                            className="about-cta-arrow-img"
                        />

                        <Link to="/register" className="about-cta-button">
                            Реєстрація
                        </Link>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Reviews;