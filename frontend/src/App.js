import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FrontPage from './components/FrontPage';
import Navbar from './components/Navbar';
import Registerscreen from './screen/Registerscreen';
import Loginscreen from './screen/Loginscreen';
import Dashboard from './screen/Dashboard';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<FrontPage />} /> 
          <Route path="/register" element={<><Navbar /><Registerscreen /></>} />
          <Route path="/login" element={<><Navbar /><Loginscreen /></>} />
          <Route path="/chat" element={<><Navbar /><Dashboard /></>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
