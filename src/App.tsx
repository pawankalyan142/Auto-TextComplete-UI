import React, { useState } from 'react';
import './App.css';

const AIAssistant: React.FC = () => {
  const [editorText, setEditorText] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);  // New state for error handling

  // Function to handle text changes and trigger autocomplete API
  const handleTextChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setEditorText(text);
    
    // If the text is long enough, fetch autocomplete suggestions
    if (text.length > 2) {  // Start fetching after 3 characters
      setIsLoading(true);
      setError(null);  // Reset error when the user starts typing
      try {
        const response = await fetch('http://localhost:8000/autocomplete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_input: text }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch autocomplete suggestions');
        }

        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } catch (error) {
        setError('Error fetching autocomplete suggestions. Please try again later.');
        console.error('Error fetching autocomplete suggestions:', error);
      }
      setIsLoading(false);
    } else {
      setSuggestions([]); // Clear suggestions if input is too short
    }
  };

  // Function to handle selecting a suggestion
  const handleSuggestionClick = (suggestion: string) => {
    setEditorText(suggestion);  // Set the selected suggestion as the text
    setSuggestions([]);  // Clear suggestions
  };

  return (
    <div className="ai-assistant-container">
      <div className="ai-suggestion">
        <h2>AI Suggestion</h2>
        <textarea
          placeholder="Start typing here..."
          value={editorText}
          onChange={handleTextChange}
          rows={5}
          cols={40}
        />
        <p>
          <strong>Click TAB to use suggestion</strong>
        </p>
        {isLoading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
        {suggestions.length > 0 && (
          <div className="suggestions-list">
            <ul>
              {suggestions.map((suggestion, index) => (
                <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="text-editor">
        <h2>Text Editor</h2>
        <textarea
          placeholder="AI suggestions appear here"
          value={editorText}
          onChange={handleTextChange}
          rows={10}
          cols={50}
        />
      </div>

      <div className="summary-section">
        <h2>Summary</h2>
        <button onClick={() => {/* Call the summarize API here */}}>Summarize</button>
        <textarea
          placeholder="Summary will appear here"
          value={editorText}  // Can change this to another state if separate summary field
          readOnly
          rows={5}
          cols={50}
        />
      </div>
    </div>
  );
};

export default AIAssistant;
