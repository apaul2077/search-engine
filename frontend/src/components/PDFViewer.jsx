import React from 'react';
import { useParams } from 'react-router-dom';

function PDFViewer() {
  const { filename, page } = useParams();
  const pdfUrl = `http://localhost:8080/books/${filename}`;
  
  return (
    <div className="container" style={{ padding: '20px' }}>
      <h2>Viewing: {filename} - Page {page}</h2>
      <iframe 
        src={`${pdfUrl}#page=${page}`}
        width="100%"
        height="600px"
        title="PDF Viewer"
        style={{ border: 'none', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
      ></iframe>
    </div>
  );
}

export default PDFViewer;
