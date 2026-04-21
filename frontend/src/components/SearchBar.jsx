import { Search, Loader2 } from 'lucide-react';

export default function SearchBar({ query, setQuery, onSearch, isSearching }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-box">
        <div className="search-icon">
          <Search size={24} />
        </div>
        <input
          type="text"
          className="search-input"
          placeholder="Describe an image... (e.g. 'a dog in a park')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isSearching}
          autoFocus
        />
        <button 
          type="submit" 
          className="search-button"
          disabled={isSearching || !query.trim()}
          title="Search"
        >
          {isSearching ? <Loader2 size={24} className="spinner" style={{width: 24, height: 24, border: 'none'}} /> : <Search size={22} />}
        </button>
      </form>
    </div>
  );
}
