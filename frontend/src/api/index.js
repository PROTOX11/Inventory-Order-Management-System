import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

export const getProducts   = ()         => api.get('/products');
export const getProduct    = (id)       => api.get(`/products/${id}`);
export const createProduct = (data)     => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id)       => api.delete(`/products/${id}`);

export const getCustomers   = ()     => api.get('/customers');
export const getCustomer    = (id)   => api.get(`/customers/${id}`);
export const createCustomer = (data) => api.post('/customers', data);
export const deleteCustomer = (id)   => api.delete(`/customers/${id}`);

export const getOrders         = ()           => api.get('/orders');
export const getOrder          = (id)         => api.get(`/orders/${id}`);
export const createOrder       = (data)       => api.post('/orders', data);
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status });
export const deleteOrder       = (id)         => api.delete(`/orders/${id}`);

export const getDashboardStats = () => api.get('/dashboard/stats');

export default api;
