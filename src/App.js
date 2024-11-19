import React, { useState } from 'react';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [sqlQuery, setSqlQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Create FormData object
      const formData = new FormData();
      formData.append('query', query);

      console.log('Sending query:', query); // Debug log

      // Make API call with FormData and proper headers
      const response = await fetch('http://192.168.0.158:8000/post_query', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': '*/*',  // Accept any response type
        },
        mode: 'cors',  // Enable CORS
      });

      console.log('Response status:', response.status); // Debug log

      if (!response.ok) {
        console.error('Response not OK:', response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid content type:', contentType);
        throw new Error('Server did not return JSON');
      }

      const data = await response.json();
      console.log('Response data:', data); // Debug log
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Update messages with the result
      setMessages(prev => [...prev, 
        { type: 'user', content: query },
        { type: 'bot', content: data.result || 'No result returned' }
      ]);
      
      // Update SQL query in right panel
      setSqlQuery(data.sql_query || '');
      
      // Clear input
      setQuery('');
      
    } catch (error) {
      console.error('Error details:', error);
      let errorMessage = 'Error processing your request.';
      
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to the server. Please check if the server is running at http://192.168.0.158:8000';
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

  return (
    <div className="app-container">
      {/* Left Sidebar */}
      <div className="sidebar left-sidebar">
        <div className="sidebar-content top-content">
          <h2>SQL DB</h2>
        </div>
        <div className="sidebar-content bottom-content">
          <h2>Web</h2>
        </div>
      </div>

      {/* Main Content */}
      <main className="main-content">
        <div className="content">
          <div className="messages-container">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.type}`}>
                {message.content}
              </div>
            ))}
          </div>
        </div>
        <form className="input-container" onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Type your message here..."
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
            {isLoading ? 'Sending...' : 'Query'}
          </button>
        </form>
      </main>

      {/* Right Sidebar */}
      <div className="sidebar right-sidebar">
        <div className="sidebar-content">
          <h2>SQL Query</h2>
          <div className="sql-query-display">
            {sqlQuery}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
