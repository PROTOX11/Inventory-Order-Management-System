import { useState, useEffect } from 'react';
import { getDashboardStats } from '../api';
import Spinner from '../components/Spinner';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => { fetchStats(); }, []);
  const fetchStats = async () => {
    try {
      const res = await getDashboardStats();
      setStats(res.data);
    } catch (err) {
      setError('Failed to load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };
  if (loading) return <Spinner />;
  if (error) return <div className="alert alert-error">{error}</div>;
  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{stats.total_products}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-label">Total Customers</div>
          <div className="stat-value">{stats.total_customers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{stats.total_orders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">₹{stats.total_revenue.toFixed(2)}</div>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <h2>⚠️ Low Stock Products</h2>
          <span className="badge badge-warning">{stats.low_stock_products.length} items</span>
        </div>
        {stats.low_stock_products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <p>All products have sufficient stock!</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Stock Left</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.low_stock_products.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong></td>
                    <td><code>{p.sku}</code></td>
                    <td>{p.stock_quantity}</td>
                    <td>₹{p.price.toFixed(2)}</td>
                    <td>
                      {p.stock_quantity === 0
                        ? <span className="badge badge-danger">Out of Stock</span>
                        : <span className="badge badge-warning">Low Stock</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
