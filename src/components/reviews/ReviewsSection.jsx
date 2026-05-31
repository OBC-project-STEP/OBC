import "./ReviewsSection.css";

import googleImg from "../../assets/review logos/pic-1.png";
import trustpilotImg from "../../assets/review logos/pic-2.png";
import yelpImg from "../../assets/review logos/pic-3.png";

export default function ReviewsSection() {
  const reviews = [
    {
      id: 1,
      rating: "5/5",
      name: "Valerii Podorozhnik",
      role: "HR at TTV",
      text:
        "OBC допоміг мені налаштувати процеси в команді, зрозуміти тонкощі спілкування з колегами та експерт Антон розказав про все просто та екологічно!",
    },
    {
      id: 2,
      rating: "5/5",
      name: "Markus Moratan",
      role: "Manager at ITC",
      text:
        "OBC допоміг мені налаштувати процеси в команді, зрозуміти тонкощі спілкування з колегами та експерт Антон розказав про все просто та екологічно!",
    },
    {
      id: 3,
      rating: "5/5",
      name: "Terasa Potapova",
      role: "Junior Product Manager at PPT",
      text:
        "OBC допоміг мені налаштувати процеси в команді, зрозуміти тонкощі спілкування з колегами та експерт Антон розказав про все просто та екологічно!",
    },
  ];

  return (
    <section className="reviews-section">
      <div className="reviews-inner">
        <h2 className="reviews-title">Відгуки наших клієнтів</h2>

        <div className="reviews-grid">
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <span className="review-rating">{review.rating}</span>
                <div>
                  <div className="review-name">{review.name}</div>
                  <div className="review-role">{review.role}</div>
                </div>
              </div>

              <p className="review-text">{review.text}</p>

              <a href="#" className="review-link">Прочитати</a>
            </div>
          ))}
        </div>

        <div className="reviews-platforms">
          <div className="review-logo">
            <img src={googleImg} alt="Google Reviews" />
          </div>

          <div className="review-logo">
            <img src={trustpilotImg} alt="Trustpilot" />
          </div>

          <div className="review-logo">
            <img src={yelpImg} alt="Yelp" />
          </div>
        </div>
      </div>
    </section>
  );
}
