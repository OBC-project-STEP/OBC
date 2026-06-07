import "./Footer.css";
import { Link } from "react-router-dom";

import logo from "../../assets/images/Mini-logo.svg";
import facebookIcon from "../../assets/app icons/Facebook.png";
import instagramIcon from "../../assets/app icons/Instagram.png";
import linkedInIcon from "../../assets/app icons/linkedIn.png";
import telegramIcon from "../../assets/app icons/Vector.png";
import xIcon from "../../assets/app icons/X (1).png";

export default function Footer()
{
    return (
        <footer className="footer">

            <div className="footer-inner">

                <div className="footer-left">

                    <img src={logo} alt="OBC Logo" className="footer-logo" />

                    <Link to="/" className="footer-home">
                        На головну
                    </Link>

                    <div className="footer-socials">
                        <img src={xIcon} alt="X" />
                        <img src={facebookIcon} alt="Facebook" />
                        <img src={telegramIcon} alt="Telegram" />
                        <img src={instagramIcon} alt="Instagram" />
                        <img src={linkedInIcon} alt="LinkedIn" />
                    </div>

                </div>

                <div className="footer-links">

                    <div className="footer-column">
                        <Link to="/knowledge">База знань</Link>
                        <Link to="/terms-conditions">Terms & Conditions</Link>
                    </div>

                    <div className="footer-column">
                        <Link to="/experts">Експерти</Link>
                        <Link to="/legal">Legal</Link>
                    </div>

                    <div className="footer-column">
                        <Link to="/about">Про нас</Link>
                        <Link to="/certification">Сертифікація</Link>
                    </div>

                    <div className="footer-column">
                        <Link to="/contacts">Контакти</Link>
                        <Link to="/reviews">Відгуки</Link>
                    </div>

                </div>

            </div>

        </footer>
    );
}