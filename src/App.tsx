import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import CustomersPage from './pages/CustomersPage';
import TrainingsPage from './pages/TrainingsPage';
import CalendarPage from './pages/CalendarPage';
import StatisticsPage from './pages/StatisticsPage';
import './index.css';

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Personal Trainer App</h1>

        <nav className="nav">
          <NavLink
            to="/customers"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Customers
          </NavLink>

          <NavLink
            to="/trainings"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Trainings
          </NavLink>

          <NavLink
            to="/calendar"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Calendar
          </NavLink>

          <NavLink
            to="/statistics"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Statistics
          </NavLink>
        </nav>
      </header>

      <main className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/customers" replace />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/trainings" element={<TrainingsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
        </Routes>
      </main>
    </div>
  );
}