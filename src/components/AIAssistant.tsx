import React, { useState, useEffect } from "react";
import { marked } from "marked";
import { toast, ToastContainer } from "react-toastify"; // Import Toastify
import "react-toastify/dist/ReactToastify.css"; // Import the CSS for Toastify
import "./AIAssistant.css";

const AIAssistant: React.FC = () => {
  const [editorText, setEditorText] = useState<string>("");
  const [summaryText, setSummaryText] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [troubleshootingSteps, setTroubleshootingSteps] = useState<string>("");
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [assignedEmployee, setAssignedEmployee] = useState<any>(null);
  const [isIssueResolved, setIsIssueResolved] = useState<boolean | null>(null);
  const [isTicketCreation, setIsTicketCreation] = useState<boolean>(false);

  let debounceTimer: NodeJS.Timeout;

  // Handle changes for the initial text area
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>, type: string) => {
    const text = e.target.value;
    if (type === 'editor') {
      setEditorText(text);  // Update the main text area for editor
    } else {
      setSummaryText(text); // Update the text area for the summary
    }
    setSuggestions([]);
    setError(null);

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (text.length % 3 === 0 && type === 'editor') {
        fetchSuggestions(text);  // Fetch suggestions only for the initial text area
      }
    }, 500);
  };

  // Fetch suggestions from the API
  const fetchSuggestions = async (text: string) => {
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
    } 

  };

  // Fetch summary and troubleshooting steps
  const fetchSummaryAndTroubleshooting = async () => {
    if (!editorText.trim()) {
      setError("Please enter some text in the editor field before summarizing.");
      return;
    }

    setIsSummarizing(true);
    try {
      // Use editorText as the payload
      const summaryResponse = await fetch("http://192.168.32.242:8213/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text_to_summarize: editorText }),  // Use editorText for summarize API
      });

      if (!summaryResponse.ok) throw new Error("Failed to fetch summary");

      const summaryData = await summaryResponse.json();
      const newSummary = summaryData.summary.replace("Here is the output sentence:", "").trim() || "";
      setSummary(newSummary);

      const troubleshootingResponse = await fetch("http://192.168.32.242:8213/api/1.0/troubleshoot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem_statement: newSummary }),
      });

      if (!troubleshootingResponse.ok) throw new Error("Failed to fetch troubleshooting steps");

      const troubleshootingData = await troubleshootingResponse.json();
      setTroubleshootingSteps(troubleshootingData.troubleshooting_steps || "");
    } catch (error) {
      console.error("Error fetching summary and troubleshooting steps:", error);
      setError("Error fetching summary and troubleshooting steps. Please try again.");
    } finally {
      setIsSummarizing(false);
    }
  };

  // Handle the click of a suggestion
  const handleSuggestionClick = (suggestion: string) => {
    setEditorText((prevText) => `${prevText}${suggestion}`);
    setSuggestions([]);
  };

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
      setAssignedEmployee(data);  // Save the ticket details to assignedEmployee
      setModalVisible(true);  // Set modal to visible after successful ticket creation
      setIsTicketCreation(true); // Set flag to true for showing ticket info modal
    } catch (error) {
      console.error("Error assigning ticket:", error);
      setError("Error assigning ticket. Please try again.");
    }
  };

  // Handle user's response to troubleshooting steps
  const handleIssueResolved = (response: boolean) => {
    setIsIssueResolved(response);

    if (response) {
      toast.success("Thank you for contacting Poorna! We hope your issue is resolved.");

      setTimeout(() => {
        window.location.reload();
      }, 2500);

    }
  };

  useEffect(() => {
    if (error) {
      alert("Error: " + error); // Temporary alert to catch any errors
    }
  }, [error]);

  return (
    <div className="ai-assistant-container">
      {/* Full-screen overlay loader */}
      {(isLoading || isSummarizing) && (
        <div className="loading-overlay">
          <div className="loader"></div>
          <p>Loading...</p>
        </div>
      )}

      <div className="ai-suggestion">
        <h2>AI Suggestion</h2>
        <textarea
          placeholder="Start typing here..."
          value={editorText}
          onChange={(e) => handleTextChange(e, 'editor')} // Set type as 'editor'
          rows={5}
          cols={40}
        />
        {isLoading && <p>Loading suggestions...</p>}
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
        <button onClick={fetchSummaryAndTroubleshooting} disabled={isSummarizing}>
          {isSummarizing ? "Summarizing..." : "Summarize"}
        </button>
      </div>

      {summary && (
        <div className="summary-section">
          <h3>Summary</h3>
          <p>{summary}</p>

          {/* Render troubleshooting steps with Markdown conversion */}
          {troubleshootingSteps && (
            <div className="troubleshooting-steps">
              <h4>Troubleshooting Steps</h4>
              <div
                className="markdown-content"
                dangerouslySetInnerHTML={{
                  __html: marked(troubleshootingSteps), // Convert Markdown to HTML
                }}
              />
            </div>
          )}

          {/* Ask if the issue is resolved */}
          {troubleshootingSteps && isIssueResolved === null && (
            <div className="issue-resolution">
              <h3>Did the above troubleshooting steps solve the issue?</h3>
              <button onClick={() => handleIssueResolved(true)}>Yes</button>
              <button onClick={() => handleIssueResolved(false)}>No</button>
            </div>
          )}

          {/* Show ticket creation prompt if issue is not resolved */}
          {isIssueResolved === false && (
            <div className="ticket-creation">
              <h3>If the issue persists, please create a ticket.</h3>
              <button onClick={handleTicketCreation}>Create Ticket</button>
            </div>
          )}
        </div>
      )}

      {/* Show Ticket Details Modal if ticket is created */}
      {modalVisible && assignedEmployee && (
  <div className="modal-overlay">
    <div className="modal">
      <h3>Ticket Assigned Successfully</h3>
      <p><strong>Ticket Id: </strong> {assignedEmployee.Ticket_Id}</p>
      <p><strong>Assigned to: </strong> {assignedEmployee.Assigned_To}</p>
      <p><strong>Ticket Description:</strong> {assignedEmployee.Ticket_Description.replace("Here is the output sentence:", "").trim()}</p>
      <button onClick={() => { setModalVisible(false); window.location.reload(); }}>Close</button>
    </div>
  </div>
)}


      {/* Toast container to display toasts */}
      <ToastContainer />
    </div>
  );
};

export default AIAssistant;
