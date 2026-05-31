import "./Contacts.css";

import facebook from "../../assets/app icons/Facebook.png";
import instagram from "../../assets/app icons/Instagram.png";
import linkedin from "../../assets/app icons/LinkedIn.png";
import telegram from "../../assets/app icons/Vector.png";
import xIcon from "../../assets/app icons/X (1).png";

export default function SocialCard() {
  return (
    <div className="contact-card">
      <div className="contact-card-center">
        <h2>Ми в соціальних мережах:</h2>

        <div className="social-icons">
          <img src={xIcon} alt="X" />
          <img src={facebook} alt="Facebook" />
          <img src={telegram} alt="Telegram" />
          <img src={instagram} alt="Instagram" />
          <img src={linkedin} alt="LinkedIn" />
        </div>
      </div>
    </div>
  );
}
