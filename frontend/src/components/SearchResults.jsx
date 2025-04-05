import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';


function SearchResults({searchedFromHome, setSearchedFromHome}) {
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
  const sessionStorageKey = `searchResults_${searchTrigger}`;

  // Function to fetch results from the backend
  const fetchResults = async () => {
    if (!searchTrigger.trim()) return;
    setLoading(true);
    try {
      const res = await api.get('/search', { params: { q: searchTrigger } });
      setResults(res.data);
      setVisibleCount(10); // Reset visible count on new query
      sessionStorage.setItem(sessionStorageKey, JSON.stringify(res.data));
    } catch (error) {
      console.error("Error fetching search results", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch results when searchTrigger changes (NOT query)
  useEffect(() => {
    if (searchTrigger) {
      const cachedResults = sessionStorage.getItem(sessionStorageKey);
      if (cachedResults && !searchedFromHome) {
        setResults(JSON.parse(cachedResults));
      } else {
        fetchResults();
        setSearchedFromHome(false); // Reset the flag after fetching
      }
    }
  }, [searchTrigger]); // Only re-run when searchTrigger changes

  // Handle search submission
  // const handleSearch = (e) => {
  //   e.preventDefault();
  //   if (query.trim()) {
  //     setSearchTrigger(query); // Update the searchTrigger (not query)
  //     fetchResults();
  //     // navigate(`/search?q=${encodeURIComponent(query)}`);
  //   }
  // };

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 10, results.length));
  };

  function getSnippetWithHighlights(content, matches) {
    if (!matches || matches.length === 0) return content.substring(0, 200) + '...';
  
    const [firstStart, firstEnd] = matches[0];
    const snippetStart = Math.max(0, firstStart - 10);
    const snippetEnd = Math.min(content.length, firstStart + 190);
    const snippet = content.substring(snippetStart, snippetEnd);
  
    let offset = snippetStart;
  
    // Filter matches that fall within the snippet range
    const filteredMatches = matches
      .filter(([start, end]) => end > snippetStart && start < snippetEnd)
      .map(([start, end]) => [start - offset, end - offset]);
  
    let highlighted = '';
    let lastIndex = 0;
  
    for (const [start, end] of filteredMatches) {
      // If highlight falls outside snippet bounds, skip
      if (start < 0 || end > snippet.length) continue;
      highlighted += snippet.substring(lastIndex, start);
      highlighted += `<mark>${snippet.substring(start, end)}</mark>`;
      lastIndex = end;
    }
  
    highlighted += snippet.substring(lastIndex);
    return highlighted + '...';
  }
  

  return (
    <div className="container">
      {/* <div style={{ textAlign: 'center', marginBottom: '20px' }}>
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
      </div> */}

      <h2>Search Results: {searchTrigger}</h2>
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
                <p dangerouslySetInnerHTML={{
  __html: getSnippetWithHighlights(result.content, result.matches)
}} />

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
