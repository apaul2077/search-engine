import { useState, useEffect } from 'react';
import { searchQuery } from '../api';

export default function useSearch(query) {
  const [allResults, setAllResults] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sessionKey = `searchResults_${query}`;

  useEffect(() => {
    if (!query) {
      setAllResults([]);
      return;
    }
    setVisibleCount(10);
    // const cached = sessionStorage.getItem(sessionKey);
      setLoading(true);
      searchQuery(query)
        .then(data => {
          setAllResults(data);
          sessionStorage.setItem(sessionKey, JSON.stringify(data));
        })
        .catch(err => setError(err))
        .finally(() => setLoading(false));
  }, [query]);

  const loadMore = () => {
    setVisibleCount(n => Math.min(n + 10, allResults.length));
  };

  // the slice you actually render:
  const results = allResults.slice(0, visibleCount);

  return { results, allResults, visibleCount, loadMore, loading, error };
}
