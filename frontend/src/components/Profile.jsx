import React, { useEffect, useState } from 'react';
import api from '../api';

function Profile() {
  const [queries, setQueries] = useState([]);

  const fetchQueries = async () => {
    try {
      const res = await api.get('/queries');
      setQueries(res.data.pastQueries);
    } catch (error) {
      console.error("Error fetching past queries", error);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  return (
    <div className="container">
      <h2 className="title-line-text">Previous Queries</h2>
      {queries.length > 0 ? (
        <div className="queries-list">
          {queries.map((q, index) => (
            <div key={index} className="query-card">
              <p className="query-text">{q.query}</p>
              <span className="query-timestamp">
                {new Date(q.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-queries">No past queries found.</p>
      )}
    </div>
  );
}

export default Profile;
