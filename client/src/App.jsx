import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ConfigProvider } from './hooks/useConfig.jsx';
import Home from './pages/Home';
import Admin from './pages/Admin';

function App() {
  return (
    <AuthProvider>
      <ConfigProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Router>
      </ConfigProvider>
    </AuthProvider>
  );
}

export default App;
