import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import useSearch from '../hooks/useSearch';

export default function SearchResults() {
  // 1) Read and write URL query via React Router
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';

  // 2) Call your custom hook
  const {
    results,
    loadMore,
    visibleCount,
    loading,
    error
  } = useSearch(q);

  // 3) New onSearch uses setSearchParams
  const onSearch = term => {
    setSearchParams({ q: term });
  };

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
      {/* Pass initial value and onSearch into your SearchBar */}
      <SearchBar initial={q} onSearch={onSearch} />

      <h2>Results for “{q}”</h2>

      {loading && <p>Loading…</p>}
      {error   && <p>Error: {error.message}</p>}

      {results.map((r, i) => (
        <Link
          key={i}
          to={`/pdf/${encodeURIComponent(r.book)}/${r.page}`}
          state={{ results, query: q }}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <div className="card">
            <h3>{r.book} – Page {r.page}</h3>
            <p>{getHighlightedSnippet(r.content, r.matches)}</p>
          </div>
        </Link>
      ))}

      {visibleCount < results.length && (
        <button onClick={loadMore} className="button load-more">
          Load More
        </button>
      )}
    </div>
  );
}
