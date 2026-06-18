import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Sidebar   from './components/Sidebar';
import Navbar    from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Products  from './pages/Products';
import Customers from './pages/Customers';
import Orders    from './pages/Orders';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        <div className="main-content">
          <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <div className="page-content">
            <Routes>
              <Route path="/"          element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products"  element={<Products />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/orders"    element={<Orders />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
