// src/components/SearchResults.jsx
import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import SearchBar from './SearchBar';

export default function SearchResults() {
  const {
    query,
    results,
    visibleCount,
    loading,
    error,
    handleSearch,
    loadMore
  } = useOutletContext();

  const onSearch = term => handleSearch(term);

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
      <SearchBar initial={query} onSearch={onSearch}/>
      <h2>Results for “{query}”</h2>

      {loading && <p>Loading…</p>}
      {error   && <p>Error: {error.message}</p>}

      {results.slice(0, visibleCount).map((r,i) => (
        <Link
          key={i}
          to={`/pdf/${encodeURIComponent(r.book)}/${r.page}`}
          state={{ results, query }}
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
