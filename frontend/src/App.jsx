import { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import ImageGrid from './components/ImageGrid';
import Loader, { EmptyState } from './components/Loader';

// Use VITE_API_URL env var in production (set in Vercel dashboard)
// Falls back to localhost for local development
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '') + '/api';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // Fetch initial stats to ensure backend is alive
  useEffect(() => {
    fetch(`${API_BASE_URL}/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => {
        console.error("Backend connection error:", err);
        setError("Cannot connect to backend server. Ensure it's running.");
      });
  }, []);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery, top_k: 12 }),
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      setResults(data.results || []);
      setSearchTime(data.time_ms || 0);
      
    } catch (err) {
      console.error("Search failed:", err);
      setError("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="app-wrapper">
      <main className="container">
        
        <header className="main-header">
          <h1 className="brand-title">PixelSearch</h1>
          <p className="brand-subtitle">
            AI-Powered Semantic Photo Retrieval combining Natural Language and Object Intelligence
          </p>
          {stats && (
            <p style={{fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '-0.5rem'}}>
              {stats.total_images} images indexed • {stats.clip_model}
            </p>
          )}
        </header>

        <SearchBar 
          query={query} 
          setQuery={setQuery} 
          onSearch={handleSearch} 
          isSearching={isSearching} 
        />

        {error && (
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <div className="error-alert">{error}</div>
          </div>
        )}

        <div style={{ marginTop: '2rem' }}>
          {isSearching ? (
            <Loader />
          ) : results.length > 0 ? (
            <ImageGrid results={results} searchTime={searchTime} />
          ) : query && !error ? (
            <EmptyState message={`No matches found for "${query}"`} />
          ) : (
            <EmptyState />
          )}
        </div>
        
      </main>
    </div>
  );
}

export default App;
