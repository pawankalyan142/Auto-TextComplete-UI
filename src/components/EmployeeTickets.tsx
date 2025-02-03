import React, { useState, useEffect } from "react";
import "./EmployeeTickets.css";

const EmployeeTickets: React.FC = () => {
  const [employeeTickets, setEmployeeTickets] = useState<any[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployeeTickets = async () => {
      try {
        const response = await fetch("http://192.168.32.242:8213/api/1.0/employee_ticket_info");
        if (!response.ok) throw new Error("Failed to fetch employee ticket info");

        const data = await response.json();
        setEmployeeTickets(data);
      } catch (error) {
        setApiError("Error fetching employee tickets. Please try again.");
        console.error("Error fetching employee tickets:", error);
      }
    };

    fetchEmployeeTickets();
  }, []);

  return (
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
  );
};

export default EmployeeTickets;
