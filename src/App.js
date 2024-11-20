import React, { useState } from 'react';
import './App.css';
import SampleQueriesPanel from './components/SampleQueriesPanel';
import './components/SampleQueriesPanel.css';

function App() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [sqlQuery, setSqlQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('sql'); // 'sql' or 'web'

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('query', query);

      const response = await fetch('http://localhost:8000/post_query', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': '*/*',
        },
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setMessages(prev => [...prev, 
        { type: 'user', content: query },
        { type: 'bot', content: data.result || 'No result returned' }
      ]);
      
      setSqlQuery(data.sql_query || '');
      setQuery('');
      
    } catch (error) {
      let errorMessage = 'Error processing your request.';
      
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to the server. Please check if the server is running.';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }

      setMessages(prev => [...prev, 
        { type: 'user', content: query },
        { type: 'error', content: errorMessage }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuerySelect = (selectedQuery) => {
    // Set the selected query to the input field
    setQuery(selectedQuery);
    
    // Automatically submit the query
    const formData = new FormData();
    formData.append('query', selectedQuery);
    
    setIsLoading(true);
    
    fetch('http://localhost:8000/post_query', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': '*/*',
      },
      mode: 'cors',
    })
    .then(response => response.json())
    .then(data => {
      setMessages(prev => [...prev, 
        { type: 'user', content: selectedQuery },
        { type: 'bot', content: data.result || 'No result returned' }
      ]);
      setSqlQuery(data.sql_query || '');
    })
    .catch(error => {
      setMessages(prev => [...prev, 
        { type: 'user', content: selectedQuery },
        { type: 'error', content: 'Error processing your request.' }
      ]);
    })
    .finally(() => {
      setIsLoading(false);
    });
  };

  return (
    <div className="app-container">
      {/* Left Sidebar */}
      <div className="sidebar left-sidebar">
        <div className="section-selector">
          <button 
            className={`section-btn ${activeSection === 'sql' ? 'active' : ''}`}
            onClick={() => setActiveSection('sql')}
          >
            SQL DB
          </button>
          <button 
            className={`section-btn ${activeSection === 'web' ? 'active' : ''}`}
            onClick={() => setActiveSection('web')}
          >
            Web
          </button>
        </div>
        
        <div className="section-content">
          {activeSection === 'sql' ? (
            <SampleQueriesPanel 
              onQuerySelect={handleQuerySelect} 
              isLoading={isLoading}
            />
          ) : (
            <div className="web-section">
              <h3>Web Search</h3>
              <p>Web search functionality coming soon...</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="main-content">
        <div className="chat-container">
          <div className="messages-container">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.type}`}>
                {message.content}
              </div>
            ))}
          </div>
          <form className="input-container" onSubmit={handleSubmit}>
            <input 
              type="text" 
              placeholder={`Type your ${activeSection === 'sql' ? 'SQL query' : 'search'} here...`}
              className="message-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className={`send-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </main>

      {/* Right Sidebar */}
      <div className="sidebar right-sidebar">
        <div className="sidebar-content">
          <h2>SQL Query</h2>
          <div className="sql-query-display">
            <pre>{sqlQuery}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
