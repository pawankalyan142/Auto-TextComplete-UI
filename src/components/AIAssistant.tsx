import React, { useState } from "react";
import "./AIAssistant.css";

const AIAssistant: React.FC = () => {
  const [editorText, setEditorText] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [assignedEmployee, setAssignedEmployee] = useState<any>(null);

  let debounceTimer: NodeJS.Timeout;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setEditorText(text);
    setSuggestions([]);
    setError(null);

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (text.length % 3 === 0) {
        fetchSuggestions(text);
      }
    }, 500);
  };

  const fetchSuggestions = async (text: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("http://192.168.32.242:8213/autocomplete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_input: text }),
      });

      if (!response.ok) throw new Error("Failed to fetch autocomplete suggestions");

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error("Error fetching autocomplete suggestions:", error);
      setError("Error fetching autocomplete suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSummary = async () => {
    setIsSummarizing(true);
    try {
      const response = await fetch("http://192.168.32.242:8213/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text_to_summarize: editorText }),
      });

      if (!response.ok) throw new Error("Failed to fetch summary");

      const data = await response.json();
      setSummary(data.summary.replace("Here is the output sentence:", "").trim() || "");
    } catch (error) {
      console.error("Error fetching summary:", error);
      setError("Error fetching summary. Please try again.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setEditorText((prevText) => `${prevText}${suggestion}`);
    setSuggestions([]);
  };

//   const handleDiscard = () => {
//     setSummary("");
//     fetchSummary();
//   };

  const handleTicketCreation = async () => {
    const payload = {
      ticket_raised_by: "SE-Arch",
      ticket_description: summary,
    };

    try {
      const response = await fetch("http://192.168.32.242:8213/api/1.0/assign_to_member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to assign ticket");

      const data = await response.json();
      setAssignedEmployee(data);
      setModalVisible(true);
    } catch (error) {
      console.error("Error assigning ticket:", error);
      setError("Error assigning ticket. Please try again.");
    }
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
        {isLoading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
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
        <button onClick={fetchSummary} disabled={isSummarizing}>
          {isSummarizing ? "Summarizing..." : "Summarize"}
        </button>
      </div>

      {summary && (
        <div className="summary-box">
          <h3>Summary</h3>
          <p>{summary}</p>
          <button onClick={handleTicketCreation}>Create Ticket</button>
        </div>
      )}

      {modalVisible && assignedEmployee && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Ticket Assigned Successfully</h3>
            <p><strong>Ticket Id: </strong> {assignedEmployee.ticket_id}</p>
            <p><strong>Assigned to: </strong> {assignedEmployee.employee_name}</p>
            <p><strong>Ticket Description:</strong> {assignedEmployee.ticket_description.replace("Here is the output sentence:", "").trim()}</p>
            <button onClick={() => setModalVisible(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
