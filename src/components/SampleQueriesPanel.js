import React, { useState } from 'react';
import { sampleQueries } from './SampleQueries';
import './SampleQueriesPanel.css';

const SampleQueriesPanel = ({ onQuerySelect, isLoading }) => {
  const [hoveredQuery, setHoveredQuery] = useState(null);

  return (
    <div className="sample-queries-panel">
      <h3>Sample Queries</h3>
      <ul className="query-list">
        {sampleQueries.map((item) => (
          <li
            key={item.id}
            className={`query-item ${isLoading ? 'processing' : ''}`}
            onClick={() => !isLoading && onQuerySelect(item.query)}
            onMouseEnter={() => setHoveredQuery(item.id)}
            onMouseLeave={() => setHoveredQuery(null)}
          >
            <h4>{item.title}</h4>
            <p className="description">{item.description}</p>
            
            {hoveredQuery === item.id && (
              <div className="query-details">
                <pre className="query-preview">{item.query}</pre>
                {isLoading && (
                  <div className="tooltip-loading">
                    <div className="spinner"></div>
                    <span>Processing...</span>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SampleQueriesPanel; 