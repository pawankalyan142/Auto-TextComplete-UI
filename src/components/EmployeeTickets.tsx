import React, { useState, useEffect } from "react";
import "./EmployeeTickets.css";

const EmployeeTickets: React.FC = () => {
  const [employeeTickets, setEmployeeTickets] = useState<any[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();  // Create AbortController instance
    const { signal } = controller;  // Get the signal to pass to the fetch

    const fetchEmployeeTickets = async () => {
      try {
        const response = await fetch("http://192.168.32.242:8213/api/1.0/employee_ticket_info", {
          method: "GET",
          signal, // Pass the signal to fetch
        });

        if (!response.ok) throw new Error("Failed to fetch employee ticket info");

        const data = await response.json();
        setEmployeeTickets(data);
      } catch (error: any) {
        if (error.name !== "AbortError") {
          setApiError("Error fetching employee tickets. Please try again.");
          console.error("Error fetching employee tickets:", error);
        }
      }
    };

    fetchEmployeeTickets();

    return () => {
      controller.abort(); // Cleanup API call on unmount
    };
  }, []);

  return (
    <div className="employee-ticket-section">
      {employeeTickets.length === 0 ? (
        <h3>No records found</h3>
      ) : (
        <>
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
                  <td>{ticket.ticket_description.replace("Here is the output sentence:", "").trim()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default EmployeeTickets;
