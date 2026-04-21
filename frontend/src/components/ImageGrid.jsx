import ResultCard from './ResultCard';

export default function ImageGrid({ results, searchTime }) {
  if (!results || results.length === 0) return null;

  return (
    <>
      <div className="results-header">
        <h2 className="results-title">Search Results</h2>
        {searchTime > 0 && (
          <span className="time-badge">
            Found {results.length} matches in {searchTime}ms
          </span>
        )}
      </div>
      
      <div className="grid-container">
        {results.map((result) => (
          <ResultCard key={result.faiss_id || result.image_id || result.filename} result={result} />
        ))}
      </div>
    </>
  );
}
