import "./ArticleCard.css";

export default function ArticleCard({ data }) {
  return (
    <div className="article-card">
      <div className="article-image">
        <div className="article-badges">
          {data.badges?.map((b, idx) => (
            <span key={idx} className={`article-badge ${b.variant}`}>
              {b.text}
            </span>
          ))}
        </div>

        <img src={data.image} alt={data.title} />
      </div>

      <div className="article-content">
        <h3>{data.title}</h3>
        <p>{data.description}</p>
      </div>

      <div className="article-actions">
        <a href="#">{data.primaryAction}</a>
        <a href="#">{data.secondaryAction}</a>
      </div>
    </div>
  );
}
