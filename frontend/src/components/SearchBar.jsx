import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

export default function SearchBar({ initial = '', onSearch }) {
  const [term, setTerm] = useState(initial);

  const handleSubmit = e => {
    e.preventDefault();
    const t = term.trim();
    if (t) onSearch(t);
  };

  return (
    <form className="search-wrapper" onSubmit={handleSubmit}>
      <input
        type="search"
        value={term}
        onChange={e => setTerm(e.target.value)}
        placeholder="Search…"
        className="search-input"
      />
      <button type="submit" className="search-btn">
        <FaSearch />
      </button>
    </form>
  );
}
