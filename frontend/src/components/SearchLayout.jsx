// src/components/SearchLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { searchQuery } from '../api';

export default function SearchLayout() {
  // read q from URL
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  // shared state
  const [query, setQuery]               = useState(initialQuery);
  const [results, setResults]           = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  const sessionKey = `searchResults_${query}`;

  // on first mount or when initial URL q changes, load from cache
  useEffect(() => {
    if (!initialQuery) return;
    const cached = sessionStorage.getItem(`searchResults_${initialQuery}`);
    if (cached) setResults(JSON.parse(cached));
  }, [initialQuery]);

  // function to run when user clicks Search
  const handleSearch = async term => {
    setResults([])
    setQuery(term);
    setSearchParams({ q: term });       // update URL
    setLoading(true);
    setError(null);
    setVisibleCount(10);

    try {
      const data = await searchQuery(term);
      setResults(data);
      sessionStorage.setItem(`searchResults_${term}`, JSON.stringify(data));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () =>
    setVisibleCount(n => Math.min(n + 10, results.length));

  // hand everything down via Outlet context
  return (
    <Outlet context={{
      query,
      results,
      visibleCount,
      loading,
      error,
      handleSearch,
      loadMore
    }}/>
  );
}
