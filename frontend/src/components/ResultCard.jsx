export default function ResultCard({ result }) {
  const { filename, filepath, tags, final_score } = result;

  // Determine score color based on confidence thresholds
  let scoreClass = 'low';
  if (final_score > 0.5) scoreClass = 'high';
  else if (final_score > 0.3) scoreClass = 'medium';

  // Construct absolute API URL for the image
  // URL should hit the static FastAPI mount
  const imageUrl = `http://127.0.0.1:8000/api/images/${filename}`;

  return (
    <div className="result-card">
      <div className="card-image-wrapper">
        <div className={`score-badge ${scoreClass}`}>
          {(final_score * 100).toFixed(1)}% Match
        </div>
        <img 
          src={imageUrl} 
          alt={filename} 
          className="card-image" 
          loading="lazy"
          onError={(e) => {
            // Fallback just in case standard pathing fails initially during dev
            e.target.src = `http://127.0.0.1:8000/images/${filename}`
          }}
        />
      </div>
      <div className="card-content">
        <h3 className="card-title" title={filename}>{filename}</h3>
        <div className="card-tags">
          {tags.slice(0, 5).map((tag, idx) => (
            <span key={idx} className="tag">{tag}</span>
          ))}
          {tags.length > 5 && (
            <span className="tag">+{tags.length - 5} more</span>
          )}
        </div>
      </div>
    </div>
  );
}
