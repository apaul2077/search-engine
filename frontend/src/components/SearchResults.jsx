import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';

function SearchResults({ searchedFromHome, setSearchedFromHome }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [searchTrigger, setSearchTrigger] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(false);

  const sessionStorageKey = `searchResults_${searchTrigger}`;

  const fetchResults = async () => {
    if (!searchTrigger.trim()) return;
    setLoading(true);
    try {
      const res = await api.get('/search', { params: { q: searchTrigger } });
      console.log(res.data);
      setResults(res.data);
      setVisibleCount(10);
      sessionStorage.setItem(sessionStorageKey, JSON.stringify(res.data));
    } catch (error) {
      console.error("Error fetching search results", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTrigger) {
      const cachedResults = sessionStorage.getItem(sessionStorageKey);
      if (cachedResults && !searchedFromHome) {
        setResults(JSON.parse(cachedResults));
      } else {
        fetchResults();
        setSearchedFromHome(false);
      }
    }
  }, [searchTrigger]);

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 10, results.length));
  };

  // ✅ JSX-safe highlighting version
  function getHighlightedSnippet(content, matches) {
    if (!matches || matches.length === 0) {
      return <span>{content.substring(0, 200)}...</span>;
    }

    const [firstStart] = matches[0];
    const snippetStart = Math.max(0, firstStart - 10);
    const snippetEnd = Math.min(content.length, firstStart + 190);
    const snippet = content.substring(snippetStart, snippetEnd);
    const offset = snippetStart;

    const filteredMatches = matches
      .filter(([start, end]) => end > snippetStart && start < snippetEnd)
      .map(([start, end]) => [start - offset, end - offset]);

    const parts = [];
    let lastIndex = 0;

    for (const [start, end] of filteredMatches) {
      if (start > lastIndex) {
        parts.push(<span key={lastIndex}>{snippet.substring(lastIndex, start)}</span>);
      }
      parts.push(<mark key={start}>{snippet.substring(start, end)}</mark>);
      lastIndex = end;
    }

    if (lastIndex < snippet.length) {
      parts.push(<span key={lastIndex}>{snippet.substring(lastIndex)}</span>);
    }

    return <>{parts}...</>;
  }

  return (
    <div className="container">
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
                <p>{getHighlightedSnippet(result.content, result.matches)}</p>
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
