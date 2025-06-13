import React from 'react';
import { BrowserRouter, Navigate, Route, Router, Routes } from 'react-router-dom';
import './styles/App.css';
import GamePage from './components/pages/GamePage';
import HomePage from './components/pages/HomePage';

function App() {

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/game" element={<GamePage />} />
          {/* <Route path="/rules" element={<RulesPage />} />
          <Route path="/about" element={<AboutPage />} /> */}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
