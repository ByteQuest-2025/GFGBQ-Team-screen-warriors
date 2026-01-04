import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import CitizenRegistration from './components/CitizenRegistration';
import AuthorityRegistration from './components/AuthorityRegistration';
import Login from './components/Login';
import SSICreation from './components/SSICreation';
import CitizenDashboard from './components/CitizenDashboard';
import AuthorityDashboard from './components/AuthorityDashboard';
import RaiseComplaint from './components/RaiseComplaint';
import ComplaintDetails from './components/ComplaintDetails';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register-citizen" element={<CitizenRegistration />} />
          <Route path="/register-authority" element={<AuthorityRegistration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create-ssi" element={<SSICreation />} />
          <Route path="/citizen-dashboard" element={<CitizenDashboard />} />
          <Route path="/authority-dashboard" element={<AuthorityDashboard />} />
          <Route path="/raise-complaint" element={<RaiseComplaint />} />
          <Route path="/complaint/:id" element={<ComplaintDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;