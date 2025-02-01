// export default AIAssistant;
import React, { useState, useEffect } from "react";
import "./App.css";

const AIAssistant: React.FC = () => {
  const [editorText, setEditorText] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);

  const [employeeTickets, setEmployeeTickets] = useState<any[]>([]); // Store the employee ticket info
  const [apiError, setApiError] = useState<string | null>(null); // Store error if API call fails

  const [modalVisible, setModalVisible] = useState<boolean>(false); // Manage modal visibility
  const [assignedEmployee, setAssignedEmployee] = useState<any>(null); // Store the assigned employee info

  let debounceTimer: NodeJS.Timeout;

  // Fetch employee ticket information on mount
  useEffect(() => {
    const fetchEmployeeTickets = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/1.0/employee_ticket_info");
        if (!response.ok) {
          throw new Error("Failed to fetch employee ticket info");
        }
        const data = await response.json();
        setEmployeeTickets(data); // Set the fetched data to state
      } catch (error) {
        setApiError("Error fetching employee tickets. Please try again.");
        console.error("Error fetching employee tickets:", error);
      }
    };

    fetchEmployeeTickets(); // Fetch data on component mount
  }, []);

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
      const response = await fetch("http://localhost:8000/autocomplete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_input: text }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch autocomplete suggestions");
      }

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
      const response = await fetch("http://localhost:8000/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text_to_summarize: editorText }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch summary");
      }

      const data = await response.json();
      setSummary(data.summary || "");
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

  const handleDiscard = () => {
    setSummary("");
    fetchSummary();
  };

  // Handle Accept & Assign API call
  const handleAcceptAndAssign = async () => {
    const payload = {
      ticket_raised_by: "SE-Arch", // Static name
      ticket_description: summary, // Use the summary as the description
    };

    try {
      const response = await fetch("http://localhost:8000/api/1.0/assign_to_member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to assign ticket");
      }

      const data = await response.json();
      setAssignedEmployee(data); // Store the assigned employee info
      setModalVisible(true); // Show modal
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
          <button onClick={handleAcceptAndAssign}>Accept & Assign</button>
          <button onClick={handleDiscard}>Discard</button>
        </div>
      )}

      {/* Display employee tickets */}
      <div className="employee-ticket-section">
        <h2>Employee Ticket Information</h2>
        {apiError && <p style={{ color: "red" }}>{apiError}</p>}
        <table>
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Queue</th>
              <th>Ticket Raised By</th>
              <th>Ticket Description</th>
            </tr>
          </thead>
          <tbody>
            {employeeTickets.map((ticket) => (
              <tr key={ticket.employee_id}>
                <td>{ticket.employee_name}</td>
                <td>{ticket.queue}</td>
                <td>{ticket.ticket_raised_by}</td>
                <td>{ticket.ticket_description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Popup for Assigned Employee */}
      {modalVisible && assignedEmployee && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Ticket Assigned Successfully</h3>
            <p><strong>Employee Name:</strong> {assignedEmployee.employee_name}</p>
            <p><strong>Ticket Description:</strong> {assignedEmployee.ticket_description}</p>
            <p><strong>Ticket Raised By:</strong> {assignedEmployee.ticket_raised_by}</p>
            <button onClick={() => setModalVisible(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;

