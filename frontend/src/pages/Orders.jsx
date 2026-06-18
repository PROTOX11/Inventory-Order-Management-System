import { useState, useEffect } from 'react';
import { getOrders, getCustomers, getProducts, createOrder, deleteOrder, updateOrderStatus } from '../api';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { ToastContainer } from '../components/Toast';

function getStatusBadge(status) {
  const map = {
    pending:   'badge-warning',
    confirmed: 'badge-primary',
    shipped:   'badge-info',
    delivered: 'badge-success',
    cancelled: 'badge-danger',
  };
  return (
    <span className={`badge ${map[status] || 'badge-gray'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

const emptyOrderForm = {
  customer_id: '',
  notes: '',
  items: [{ product_id: '', quantity: 1 }],
};

function Orders() {
  const [orders, setOrders]       = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [orderForm, setOrderForm]             = useState(emptyOrderForm);
  const [formError, setFormError]             = useState('');
  const [submitting, setSubmitting]           = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder]     = useState(null);
  const [toasts, setToasts]       = useState([]);
  const [confirmingId, setConfirmingId] = useState(null);
  useEffect(() => { fetchAll(); }, []);
  const fetchAll = async () => {
    try {
      const [ordersRes, customersRes, productsRes] = await Promise.all([
        getOrders(), getCustomers(), getProducts(),
      ]);
      setOrders(ordersRes.data);
      setCustomers(customersRes.data);
      setProducts(productsRes.data);
    } catch {
      setError('Failed to load data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };
  const showToast = (message, type = 'success') => {
    setToasts((prev) => [...prev, { id: Date.now(), message, type }]);
  };
  const openCreateModal = () => {
    setOrderForm(emptyOrderForm);
    setFormError('');
    setShowCreateModal(true);
  };
  const addItem = () => {
    setOrderForm((prev) => ({
      ...prev,
      items: [...prev.items, { product_id: '', quantity: 1 }],
    }));
  };
  const removeItem = (index) => {
    setOrderForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };
  const updateItem = (index, field, value) => {
    setOrderForm((prev) => {
      const updated = [...prev.items];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, items: updated };
    });
  };
  const calculateTotal = () => {
    return orderForm.items.reduce((total, item) => {
      const product = products.find((p) => p.id === parseInt(item.product_id));
      if (product && item.quantity > 0) {
        return total + product.price * parseInt(item.quantity);
      }
      return total;
    }, 0);
  };
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!orderForm.customer_id) return setFormError('Please select a customer');
    for (let i = 0; i < orderForm.items.length; i++) {
      const item = orderForm.items[i];
      if (!item.product_id) return setFormError(`Item ${i + 1}: Please select a product`);
      if (!item.quantity || parseInt(item.quantity) <= 0)
        return setFormError(`Item ${i + 1}: Quantity must be at least 1`);
    }
    const ids = orderForm.items.map((i) => i.product_id);
    if (ids.some((id, idx) => ids.indexOf(id) !== idx)) {
      return setFormError('You have duplicate products. Please combine them into one row.');
    }
    setSubmitting(true);
    try {
      await createOrder({
        customer_id: parseInt(orderForm.customer_id),
        notes: orderForm.notes,
        items: orderForm.items.map((item) => ({
          product_id: parseInt(item.product_id),
          quantity: parseInt(item.quantity),
        })),
      });
      showToast('Order created successfully!');
      setShowCreateModal(false);
      fetchAll();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  const handleCancelOrder = async (order) => {
    try {
      await deleteOrder(order.id);
      showToast(`Order #${order.id} cancelled. Stock has been restored.`);
      setConfirmingId(null);
      if (showDetailModal) setShowDetailModal(false);
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to cancel order.', 'error');
      setConfirmingId(null);
    }
  };
  const handleUpdateStatus = async (order, newStatus) => {
    try {
      await updateOrderStatus(order.id, newStatus);
      showToast(`Order #${order.id} marked as ${newStatus}.`);
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update status.', 'error');
    }
  };
  const handleDeleteHistory = async (order) => {
    try {
      await deleteOrder(order.id);
      showToast(`Order #${order.id} history deleted.`);
      setConfirmingId(null);
      if (showDetailModal) setShowDetailModal(false);
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete order history.', 'error');
      setConfirmingId(null);
    }
  };
  if (loading) return <Spinner />;
  return (
    <div>
      <ToastContainer toasts={toasts} onRemove={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
      <div className="page-header">
        <div>
          <h1>Orders</h1>
          <p>Create and manage customer orders</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>+ Create Order</button>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="card">
        <div className="card-header">
          <h2>All Orders ({orders.length})</h2>
        </div>
        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <p>No orders yet. Create your first order!</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td><strong>#{order.id}</strong></td>
                    <td>{order.customer_name}</td>
                    <td>{order.items.length} item(s)</td>
                    <td><strong>₹{order.total_amount.toFixed(2)}</strong></td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td className="text-muted">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td style={{ width: '250px', minWidth: '250px' }}>
                      <div style={{ width: '250px' }}>
                        {confirmingId === order.id ? (
                          <div className="action-group confirm-group">
                            <button className="action-btn action-btn-edit" onClick={() => { setConfirmingId(null); setSelectedOrder(order); setShowDetailModal(true); }} title="View order details">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </svg>
                              Details
                            </button>
                            <span className="confirm-label">Sure?</span>
                            <button className="action-btn action-btn-confirm" onClick={() => order.status === 'delivered' ? handleDeleteHistory(order) : handleCancelOrder(order)}>✓ Yes</button>
                            <button className="action-btn action-btn-cancel-confirm" onClick={() => setConfirmingId(null)}>✕ No</button>
                          </div>
                        ) : (
                          <div className="action-group">
                            <button className="action-btn action-btn-edit" onClick={() => { setSelectedOrder(order); setShowDetailModal(true); }} title="View order details">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </svg>
                              Details
                            </button>
                            {order.status === 'pending' && (
                              <>
                                <button className="action-btn action-btn-deliver" onClick={() => handleUpdateStatus(order, 'delivered')} title="Mark as Delivered">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"/>
                                  </svg>
                                  Deliver
                                </button>
                                <button className="action-btn action-btn-delete" onClick={() => setConfirmingId(order.id)} title="Cancel order">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                  </svg>
                                  Cancel
                                </button>
                              </>
                            )}
                            {order.status === 'delivered' && (
                              <button className="action-btn action-btn-delete" onClick={() => setConfirmingId(order.id)} title="Delete order history">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6"/>
                                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                  <path d="M10 11v6M14 11v6"/>
                                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                </svg>
                                Delete History
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Order" size="lg">
        <form onSubmit={handleCreateOrder}>
          <div className="modal-body">
            {formError && <div className="alert alert-error">{formError}</div>}
            <div className="form-group">
              <label className="form-label">Customer <span className="required">*</span></label>
              <select className="form-control" value={orderForm.customer_id} onChange={(e) => setOrderForm({ ...orderForm, customer_id: e.target.value })}>
                <option value="">-- Select a customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                ))}
              </select>
              {customers.length === 0 && (
                <p className="form-label" style={{ color: 'var(--danger)', marginTop: '4px' }}>
                  No customers available. Please add a customer first.
                </p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Order Items <span className="required">*</span></label>
              {orderForm.items.map((item, index) => {
                const selected = products.find((p) => p.id === parseInt(item.product_id));
                return (
                  <div key={index} className="item-row">
                    <select className="form-control" value={item.product_id} onChange={(e) => updateItem(index, 'product_id', e.target.value)}>
                      <option value="">-- Select product --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id} disabled={p.stock_quantity === 0}>
                          {p.name} — ₹{p.price.toFixed(2)} (Stock: {p.stock_quantity})
                        </option>
                      ))}
                    </select>
                    <div className="qty-stepper">
                      <button type="button" className="qty-btn" onClick={() => updateItem(index, 'quantity', Math.max(1, parseInt(item.quantity || 1) - 1))} disabled={parseInt(item.quantity) <= 1}>−</button>
                      <input
                        className="qty-input"
                        type="number"
                        min="1"
                        max={selected?.stock_quantity || 9999}
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      />
                      <button type="button" className="qty-btn" onClick={() => updateItem(index, 'quantity', Math.min(selected?.stock_quantity || 9999, parseInt(item.quantity || 1) + 1))} disabled={selected && parseInt(item.quantity) >= selected.stock_quantity}>+</button>
                    </div>
                    <button type="button" className="btn-icon" onClick={() => removeItem(index)} disabled={orderForm.items.length === 1} title="Remove item">🗑️</button>
                  </div>
                );
              })}
              <button type="button" className="btn btn-secondary btn-sm" onClick={addItem} style={{ marginTop: '8px' }}>+ Add Another Product</button>
            </div>
            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <textarea className="form-control" value={orderForm.notes} onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })} placeholder="Any special instructions..." rows={2} />
            </div>
            <div className="total-display">
              Order Total: <span style={{ color: 'var(--primary)' }}>₹{calculateTotal().toFixed(2)}</span>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Place Order'}
            </button>
          </div>
        </form>
      </Modal>
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title={`Order #${selectedOrder?.id} Details`} size="lg">
        {selectedOrder && (
          <>
            <div className="modal-body">
              <div className="form-row" style={{ marginBottom: '16px' }}>
                <div>
                  <p className="text-muted" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Customer</p>
                  <p><strong>{selectedOrder.customer_name}</strong></p>
                </div>
                <div>
                  <p className="text-muted" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Status</p>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div>
                  <p className="text-muted" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Date</p>
                  <p>{new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
              </div>
              {selectedOrder.notes && (
                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
                  <p className="text-muted" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Notes</p>
                  <p>{selectedOrder.notes}</p>
                </div>
              )}
              <p className="form-label" style={{ marginBottom: '8px' }}>Items Ordered</p>
              <table className="order-items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Unit Price</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.product_name}</td>
                      <td><code>{item.product_sku}</code></td>
                      <td>₹{item.unit_price.toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td><strong>₹{item.subtotal.toFixed(2)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="total-display">
                Total: <span style={{ color: 'var(--primary)' }}>₹{selectedOrder.total_amount.toFixed(2)}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>Close</button>
              <button className="btn btn-danger" onClick={() => handleCancelOrder(selectedOrder)}>✕ Cancel Order</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

export default Orders;
