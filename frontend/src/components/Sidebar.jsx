import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/products',  icon: '📦', label: 'Products'  },
  { path: '/customers', icon: '👥', label: 'Customers' },
  { path: '/orders',    icon: '🛒', label: 'Orders'    },
];

function Sidebar({ isOpen, onClose }) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <h1>
          <span style={{ color: '#fff',           display: 'block', lineHeight: '1.3' }}>Inventory &amp;</span>
          <span style={{ color: 'var(--primary)', display: 'block', lineHeight: '1.3' }}>Order Management</span>
        </h1>
      </div>

      <nav className="sidebar-nav">
        <p className="sidebar-section-label">Main Menu</p>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p>v1.0.0</p>
      </div>
    </aside>
  );
}

export default Sidebar;
