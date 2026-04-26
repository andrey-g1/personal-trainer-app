import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import CustomersPage from './pages/CustomersPage';
import TrainingsPage from './pages/TrainingsPage';
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
        </nav>
      </header>

      <main className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/customers" replace />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/trainings" element={<TrainingsPage />} />
        </Routes>
      </main>
    </div>
  );
}