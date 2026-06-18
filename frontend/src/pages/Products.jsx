import { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { ToastContainer } from '../components/Toast';

function getStockBadge(qty) {
  if (qty === 0) return <span className="badge badge-danger">Out of Stock</span>;
  if (qty < 10)  return <span className="badge badge-warning">Low ({qty})</span>;
  return <span className="badge badge-success">In Stock ({qty})</span>;
}

const emptyForm = { name: '', sku: '', description: '', price: '', stock_quantity: '' };

function Products() {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState('');
  const [showModal, setShowModal]     = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [formData, setFormData]       = useState(emptyForm);
  const [formError, setFormError]     = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [toasts, setToasts]           = useState([]);
  const [confirmingId, setConfirmingId] = useState(null);
  useEffect(() => { fetchProducts(); }, []);
  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch {
      setError('Failed to load products. Please refresh.');
    } finally {
      setLoading(false);
    }
  };
  const showToast = (message, type = 'success') => {
    setToasts((prev) => [...prev, { id: Date.now(), message, type }]);
  };
  const openAddModal = () => {
    setEditProduct(null);
    setFormData(emptyForm);
    setFormError('');
    setShowModal(true);
  };
  const openEditModal = (product) => {
    setEditProduct(product);
    setFormData({
      name:           product.name,
      sku:            product.sku,
      description:    product.description || '',
      price:          product.price,
      stock_quantity: product.stock_quantity,
    });
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
    if (!formData.name.trim())       return setFormError('Product name is required');
    if (!formData.sku.trim())        return setFormError('SKU is required');
    if (formData.price === '')       return setFormError('Price is required');
    if (parseFloat(formData.price) < 0)  return setFormError('Price cannot be negative');
    if (formData.stock_quantity !== '' && parseInt(formData.stock_quantity) < 0)
      return setFormError('Stock quantity cannot be negative');
    const payload = {
      name:           formData.name.trim(),
      sku:            formData.sku.trim(),
      description:    formData.description,
      price:          parseFloat(formData.price),
      stock_quantity: parseInt(formData.stock_quantity) || 0,
    };
    setSubmitting(true);
    try {
      if (editProduct) {
        await updateProduct(editProduct.id, payload);
        showToast('Product updated successfully!');
      } else {
        await createProduct(payload);
        showToast('Product added successfully!');
      }
      closeModal();
      fetchProducts();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  const handleDelete = async (product) => {
    try {
      await deleteProduct(product.id);
      showToast(`"${product.name}" deleted`);
      setConfirmingId(null);
      fetchProducts();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete product.', 'error');
      setConfirmingId(null);
    }
  };
  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );
  if (loading) return <Spinner />;
  return (
    <div>
      <ToastContainer toasts={toasts} onRemove={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p>Manage your product catalog and inventory levels</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>+ Add Product</button>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="card">
        <div className="card-header">
          <h2>All Products ({filtered.length})</h2>
          <input
            className="search-input"
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <p>{search ? 'No products match your search.' : 'No products yet. Add your first one!'}</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td className="text-muted">{p.id}</td>
                    <td>
                      <strong>{p.name}</strong>
                      {p.description && (
                        <p className="text-muted" style={{ fontSize: '12px', marginTop: '2px' }}>
                          {p.description.length > 60 ? p.description.substring(0, 60) + '…' : p.description}
                        </p>
                      )}
                    </td>
                    <td><code>{p.sku}</code></td>
                    <td>₹{p.price.toFixed(2)}</td>
                    <td>{getStockBadge(p.stock_quantity)}</td>
                    <td className="text-muted">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td style={{ width: '210px', minWidth: '210px' }}>
                      <div style={{ width: '210px' }}>
                        {confirmingId === p.id ? (
                          <div className="action-group confirm-group">
                            <button className="action-btn action-btn-edit" onClick={() => { setConfirmingId(null); openEditModal(p); }} title="Edit product">
                              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                              Edit
                            </button>
                            <span className="confirm-label">Sure?</span>
                            <button className="action-btn action-btn-confirm" onClick={() => handleDelete(p)}>✓ Yes</button>
                            <button className="action-btn action-btn-cancel-confirm" onClick={() => setConfirmingId(null)}>✕ No</button>
                          </div>
                        ) : (
                          <div className="action-group">
                            <button className="action-btn action-btn-edit" onClick={() => openEditModal(p)} title="Edit product">
                              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                              Edit
                            </button>
                            <button className="action-btn action-btn-delete" onClick={() => setConfirmingId(p.id)} title="Delete product">
                              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <Modal isOpen={showModal} onClose={closeModal} title={editProduct ? 'Edit Product' : 'Add New Product'}>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {formError && <div className="alert alert-error">{formError}</div>}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Product Name <span className="required">*</span></label>
                <input className="form-control" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Wireless Mouse" />
              </div>
              <div className="form-group">
                <label className="form-label">SKU / Code <span className="required">*</span></label>
                <input className="form-control" name="sku" value={formData.sku} onChange={handleChange} placeholder="e.g. WM-001" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" name="description" value={formData.description} onChange={handleChange} placeholder="Optional..." rows={3} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price (₹) <span className="required">*</span></label>
                <input className="form-control" type="number" name="price" value={formData.price} onChange={handleChange} placeholder="0.00" min="0" step="0.01" />
              </div>
              <div className="form-group">
                <label className="form-label">Stock Quantity</label>
                <div className="qty-stepper" style={{ width: '100%' }}>
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setFormData((prev) => ({ ...prev, stock_quantity: Math.max(0, parseInt(prev.stock_quantity || 0) - 1) }))}
                    disabled={parseInt(formData.stock_quantity) <= 0}
                  >−</button>
                  <input
                    className="qty-input"
                    style={{ flex: 1, width: 'auto' }}
                    type="number"
                    name="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                  />
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setFormData((prev) => ({ ...prev, stock_quantity: parseInt(prev.stock_quantity || 0) + 1 }))}
                  >+</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : editProduct ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Products;
