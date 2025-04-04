import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';

function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get the initial query from URL parameter
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [searchTrigger, setSearchTrigger] = useState(initialQuery); // Triggers search
  const [results, setResults] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(false);

  // Create a unique key for caching based on the query
  const localStorageKey = `searchResults_${searchTrigger}`;

  // Function to fetch results from the backend
  const fetchResults = async () => {
    if (!searchTrigger.trim()) return;
    setLoading(true);
    try {
      const res = await api.get('/search', { params: { q: searchTrigger } });
      setResults(res.data);
      setVisibleCount(10); // Reset visible count on new query
      localStorage.setItem(localStorageKey, JSON.stringify(res.data));
    } catch (error) {
      console.error("Error fetching search results", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch results when searchTrigger changes (NOT query)
  useEffect(() => {
    if (searchTrigger) {
      const cachedResults = localStorage.getItem(localStorageKey);
      if (cachedResults) {
        setResults(JSON.parse(cachedResults));
      } else {
        fetchResults();
      }
    }
  }, [searchTrigger]); // Only re-run when searchTrigger changes

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchTrigger(query); // Update the searchTrigger (not query)
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    const words = query.split(/\s+/).filter(Boolean);
    const regex = new RegExp(`(${words.join('|')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  const getHighlightedSnippet = (text, query) => {
    if (!query) return text;

    const words = query.split(/\s+/).filter(Boolean);
    const regex = new RegExp(`(${words.join('|')})`, 'i');
    const match = text.match(regex);

    if (!match) {
      // Fallback if no match found
      return highlightText(text.substring(0, 200), query);
    }

    const matchIndex = match.index;
    const start = Math.max(0, matchIndex - 10);
    const end = Math.min(text.length, matchIndex + 190);

    const snippet = text.substring(start, end);

    return highlightText(snippet, query);
  };



  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 10, results.length));
  };

  return (
    <div className="container">
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-bar"
            placeholder="Enter your search query..."
            spellCheck="true"
          />
          <button type="submit" className="search-results-button" style={{ marginLeft: '10px' }}>
            Search
          </button>
        </form>
      </div>

      <h2>Search Results for "{searchTrigger}"</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {results.slice(0, visibleCount).map((result, index) => (
            <Link
              key={index}
              to={`/pdf/${encodeURIComponent(result.book)}/${result.page}`}
              state={{ results, query }}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="card">
                <h3>{result.book} - Page {result.page}</h3>
                <p
                  dangerouslySetInnerHTML={{
                    __html: getHighlightedSnippet(result.content, searchTrigger),
                  }}
                ></p>
              </div>
            </Link>

          ))}
          {visibleCount < results.length && (
            <button onClick={loadMore} className="button load-more">
              Load More
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default SearchResults;
