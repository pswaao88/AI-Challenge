// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage/MainPage';
import GlobalStyle from './styles/GlobalStyle';

function App() {
  return (
      <Router>
        <GlobalStyle />
        <div className="App">
          <Routes>
            <Route path="/" element={<MainPage />} />
          </Routes>
        </div>
      </Router>
  );
}

export default App;

