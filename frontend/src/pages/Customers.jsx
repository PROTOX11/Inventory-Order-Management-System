import { useState, useEffect } from 'react';
import { getCustomers, createCustomer, deleteCustomer } from '../api';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { ToastContainer } from '../components/Toast';

const emptyForm = { name: '', email: '', phone: '', address: '' };

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [formData, setFormData]     = useState(emptyForm);
  const [formError, setFormError]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts]         = useState([]);
  const [confirmingId, setConfirmingId] = useState(null);
  useEffect(() => { fetchCustomers(); }, []);
  const fetchCustomers = async () => {
    try {
      const res = await getCustomers();
      setCustomers(res.data);
    } catch {
      setError('Failed to load customers. Please refresh.');
    } finally {
      setLoading(false);
    }
  };
  const showToast = (message, type = 'success') => {
    setToasts((prev) => [...prev, { id: Date.now(), message, type }]);
  };
  const openModal = () => {
    setFormData(emptyForm);
    setFormError('');
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setFormError('');
  };
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name.trim())  return setFormError('Name is required');
    if (!formData.email.trim()) return setFormError('Email is required');
    if (!formData.phone.trim()) return setFormError('Phone number is required');
    if (!formData.email.includes('@')) return setFormError('Please enter a valid email address');
    setSubmitting(true);
    try {
      await createCustomer(formData);
      showToast('Customer added successfully!');
      closeModal();
      fetchCustomers();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  const handleDelete = async (customer) => {
    try {
      await deleteCustomer(customer.id);
      showToast(`"${customer.name}" deleted`);
      setConfirmingId(null);
      fetchCustomers();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete customer.', 'error');
      setConfirmingId(null);
    }
  };
  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );
  if (loading) return <Spinner />;
  return (
    <div>
      <ToastContainer toasts={toasts} onRemove={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p>View and manage your customer list</p>
        </div>
        <button className="btn btn-primary" onClick={openModal}>+ Add Customer</button>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="card">
        <div className="card-header">
          <h2>All Customers ({filtered.length})</h2>
          <input
            className="search-input"
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <p>{search ? 'No customers match your search.' : 'No customers yet. Add your first one!'}</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td className="text-muted">{c.id}</td>
                    <td><strong>{c.name}</strong></td>
                    <td>{c.email}</td>
                    <td>{c.phone}</td>
                    <td className="text-muted">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td style={{ width: '160px', minWidth: '160px' }}>
                      <div style={{ width: '160px' }}>
                        {confirmingId === c.id ? (
                          <div className="action-group confirm-group">
                            <span className="confirm-label">Sure?</span>
                            <button className="action-btn action-btn-confirm" onClick={() => handleDelete(c)}>✓ Yes</button>
                            <button className="action-btn action-btn-cancel-confirm" onClick={() => setConfirmingId(null)}>✕ No</button>
                          </div>
                        ) : (
                          <div className="action-group">
                            <button className="action-btn action-btn-delete" onClick={() => setConfirmingId(c.id)} title="Delete customer">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                <path d="M10 11v6M14 11v6"/>
                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                              </svg>
                              Delete
                            </button>
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
      <Modal isOpen={showModal} onClose={closeModal} title="Add New Customer">
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {formError && <div className="alert alert-error">{formError}</div>}
            <div className="form-group">
              <label className="form-label">Full Name <span className="required">*</span></label>
              <input className="form-control" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Rahul Sharma" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email Address <span className="required">*</span></label>
                <input className="form-control" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="rahul@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number <span className="required">*</span></label>
                <input className="form-control" type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea className="form-control" name="address" value={formData.address} onChange={handleChange} placeholder="Optional address..." rows={2} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Customer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Customers;
