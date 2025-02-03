import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import AIAssistance from "./components/AIAssistant";
import EmployeeTickets from "./components/EmployeeTickets";
import "./App.css"; 

const App = () => {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/ai-assistance" element={<AIAssistance />} />
          <Route path="/employee-tickets" element={<EmployeeTickets />} />
        </Routes>
      </div>
    </Router>
  );
};

const Navbar = () => {
  const location = useLocation();

  return (
    <div className="header">
      <nav className="nav-links">
        <a href="/ai-assistance" className={`nav-item ${location.pathname === "/ai-assistance" ? "active" : ""}`}>
          AI Assistance
        </a>
        <a href="/employee-tickets" className={`nav-item ${location.pathname === "/employee-tickets" ? "active" : ""}`}>
          Employee Tickets
        </a>
      </nav>
    </div>
  );
};

export default App;
