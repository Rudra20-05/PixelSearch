import { useState } from 'react';
import EditModal from './EditModal';

export default function ResultCard({ result }) {
  const { filename, tags = [], final_score } = result;
  const [showEdit, setShowEdit] = useState(false);

  // Score colour thresholds
  let scoreClass = 'low';
  if (final_score > 0.5) scoreClass = 'high';
  else if (final_score > 0.3) scoreClass = 'medium';

  // Primary URL hits /api/images/ which is now correctly mounted
  const imageUrl = `http://127.0.0.1:8000/api/images/${filename}`;

  return (
    <>
      <div className="result-card">
        <div className="card-image-wrapper">
          {/* Score badge */}
          <div className={`score-badge ${scoreClass}`}>
            {(final_score * 100).toFixed(1)}% Match
          </div>

          <img
            src={imageUrl}
            alt={filename}
            className="card-image"
            loading="lazy"
            onError={(e) => {
              // Fallback to old /images/ mount
              if (!e.target.src.includes('/images/')) {
                e.target.src = `http://127.0.0.1:8000/images/${filename}`;
              }
            }}
          />

          {/* Hover overlay with Edit button */}
          <div className="card-hover-overlay">
            <button
              className="edit-ai-btn"
              onClick={() => setShowEdit(true)}
              title="Edit or animate this image using AI"
            >
              ✨ Edit with AI
            </button>
          </div>
        </div>

        <div className="card-content">
          <h3 className="card-title" title={filename}>{filename}</h3>
          <div className="card-tags">
            {tags.slice(0, 5).map((tag) => (
              <span key={tag} className="tag">{tag}</span>
            ))}
            {tags.length > 5 && (
              <span className="tag">+{tags.length - 5} more</span>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal — rendered at root level via portal-like pattern */}
      {showEdit && (
        <EditModal image={result} onClose={() => setShowEdit(false)} />
      )}
    </>
  );
}
