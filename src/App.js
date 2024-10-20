import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './App.css';
import axios from 'axios';

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [query, setQuery] = useState('');
  const [responses, setResponses] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  const chatContainerRef = useRef(null); // Ref for auto-scroll

  // Function to create a chat session
  const createChatSession = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/chat-session');
      setSessionId(res.data.sessionId);
    } catch (error) {
      console.error('Error creating session:', error);
      setError('Error creating session. Please try again.');
    }
  };

  useEffect(() => {
    createChatSession();
  }, []);

  // Function to submit a query
  const submitQuery = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/submit-query', {
        sessionId,
        query,
      });
      const answer = res.data.data?.answer || 'No answer available';
      setResponses([...responses, { query, response: answer }]);
      setQuery('');
      setShowIntro(false);
    } catch (error) {
      console.error('Error submitting query:', error);
      setError('Error submitting query. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  // Auto-scroll to the bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [responses, loading]);

  // Copy to clipboard function
  const handleCopy = async (code, index) => {
    try {
      await navigator.clipboard.writeText(code);
      setResponses((prevResponses) =>
        prevResponses.map((entry, i) =>
          i === index ? { ...entry, copied: true } : entry
        )
      );
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <h1 className="sidebar-heading">Previous Chats</h1>
        <button className="new-chat-button">New Chat +</button>
      </div>
      <div className="main-content">
        <div className="chat-content" ref={chatContainerRef}>
          {showIntro && (
            <div className="intro-message">
              <h3>Welcome to LawBot!</h3>
              <p>Your assistant for legal queries like IPC sections, live court streaming, and more.</p>
            </div>
          )}
          <div className="user-queries-container">
            {responses.map((entry, index) => (
              <div key={index} className="user-query">
                <div className="user-input">{entry.query}</div>
                <div className="response-output">
                  <ReactMarkdown
                    components={{
                      code({ inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        const codeContent = String(children).replace(/\n$/, '');
                        return !inline ? (
                          <div className="code-block-container">
                            <button
                              className={`copy-button ${entry.copied ? 'copied' : ''}`}
                              onClick={() => handleCopy(codeContent, index)}
                            >
                              {entry.copied ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="green" className="bi bi-check" viewBox="0 0 16 16">
                                  <path d="M13.854 3.646a.5.5 0 0 1 0 .708L6.707 11.5 4.146 8.854a.5.5 0 1 1 .708-.708l2.146 2.146 6.146-6.146a.5.5 0 0 1 .708 0z"/>
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-clipboard" viewBox="0 0 16 16">
                                  <path d="M10 1.5v1H6v-1a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5z"/>
                                  <path d="M5.5 0a1.5 1.5 0 0 0-1.5 1.5V2h-1A1.5 1.5 0 0 0 1.5 3.5v11A1.5 1.5 0 0 0 3 16h10a1.5 1.5 0 0 0 1.5-1.5v-11A1.5 1.5 0 0 0 13 2h-1v-.5A1.5 1.5 0 0 0 10.5 0h-5zM6 3v-.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V3h3a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5v-11A.5.5 0 0 1 3 3h3z"/>
                                </svg>
                              )}
                            </button>
                            <SyntaxHighlighter style={oneDark} language={match ? match[1] : null} PreTag="div" {...props}>
                              {codeContent}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                      strong({ children }) {
                        return <strong>{children}</strong>; // Bold text
                      },
                    }}
                  >
                    {entry.response}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            {loading && <div className="loading-animation"><div className="spinner"></div></div>}
            {error && <div className="error">{error}</div>}
          </div>
          <div className="form-container">
            <input
              type="text"
              placeholder="Enter your query"
              value={query}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && submitQuery()}
              className="query-input"
            />
            <button
              className="submit-button"
              onClick={submitQuery}
              disabled={!query.trim()}
            >
              ↵
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;