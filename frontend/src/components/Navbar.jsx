import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/products':  'Products',
  '/customers': 'Customers',
  '/orders':    'Orders',
};

function Navbar({ onMenuClick }) {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Inventory Manager';

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="menu-btn" onClick={onMenuClick} aria-label="Toggle menu">☰</button>
        <h2 className="navbar-title">{title}</h2>
      </div>
      <div>
        <span className="navbar-badge">Admin</span>
      </div>
    </header>
  );
}

export default Navbar;
