/**
 * Shared API utility — automatically attaches the JWT Bearer token
 * from localStorage to every outgoing request.
 *
 * Usage:
 *   import { apiFetch, API_BASE } from '../utils/api';
 *
 *   // GET
 *   const data = await apiFetch('/api/orders/me');
 *
 *   // POST
 *   const data = await apiFetch('/api/orders', {
 *     method: 'POST',
 *     body: JSON.stringify(payload),
 *   });
 */

export const API_BASE = 'http://localhost:8080';
const AUTH_STORAGE_KEY = 'packora_user_auth';

/**
 * Returns the JWT token from localStorage, or null.
 */
export function getStoredToken() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token || null;
  } catch {
    return null;
  }
}

/**
 * Wrapper around fetch() that:
 *  1. Prepends API_BASE if the url starts with "/"
 *  2. Sets Content-Type to application/json (unless overridden or body is FormData)
 *  3. Attaches Authorization: Bearer <token> if a token exists
 *  4. Parses JSON response automatically
 *  5. On 401, clears stored auth and redirects to /login
 *
 * Returns the parsed JSON body.
 * Throws an error with `status` and `data` properties on non-2xx responses.
 */
export async function apiFetch(url, options = {}) {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;

  const headers = { ...(options.headers || {}) };

  // Auto-set JSON content-type unless body is FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  // Attach JWT token
  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  // Handle 401 — token expired or invalid
  if (response.status === 401) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    // Only redirect if we're in a browser context and not already on login
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    const err = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }

  // Try to parse JSON (some responses may be empty, e.g. 204)
  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    const err = new Error(data?.message || `Request failed with status ${response.status}`);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

// ── User / Profile API ────────────────────────────────────────────────
export const userApi = {
  /** GET /api/users/me – current authenticated user's profile */
  getMe: () => apiFetch('/api/users/me'),

  /** PUT /api/users/me – update current user's profile */
  updateMe: (data) =>
    apiFetch('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /** PUT /api/users/me/password – change password */
  updatePassword: (data) =>
    apiFetch('/api/users/me/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /** GET /api/users/me/addresses – get user's saved addresses */
  getAddresses: () => apiFetch('/api/users/me/addresses'),

  /** POST /api/users/me/addresses – save a new address */
  addAddress: (data) =>
    apiFetch('/api/users/me/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** PUT /api/users/me/addresses/:id – update an existing address */
  updateAddress: (id, data) =>
    apiFetch(`/api/users/me/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /** DELETE /api/users/me/addresses/:id – delete a saved address */
  deleteAddress: (id) =>
    apiFetch(`/api/users/me/addresses/${id}`, {
      method: 'DELETE',
    }),

  /** PUT /api/users/me/addresses/:id/primary – set address as primary */
  setPrimaryAddress: (id) =>
    apiFetch(`/api/users/me/addresses/${id}/primary`, {
      method: 'PUT',
    }),

  /** GET /api/users/me/notifications – get notification prefs */
  getNotificationPrefs: () => apiFetch('/api/users/me/notifications'),

  /** PUT /api/users/me/notifications – update notification prefs */
  updateNotificationPrefs: (data) =>
    apiFetch('/api/users/me/notifications', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /** GET /api/users – list all users (ADMIN) */
  getAll: () => apiFetch('/api/users'),

  /** GET /api/users/:id – get specific user (ADMIN) */
  getById: (id) => apiFetch(`/api/users/${id}`),
};

// ── Product Catalog API ───────────────────────────────────────────────

/** Maps backend ProductResponse (imageUrl) → frontend-friendly shape (image) */
function normalizeProduct(p) {
  return {
    ...p,
    id: String(p.id),
    image: p.imageUrl || '',
    price: typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0,
    minOrder: p.minOrder ?? 1,
    stock: p.stock ?? 0,
    inStock: p.inStock ?? true,
    sizes: p.sizes ?? [],
    materials: p.materials ?? [],
  };
}

export const productApi = {
  /** GET /api/products – list all products */
  getAll: () => apiFetch('/api/products').then((list) => list.map(normalizeProduct)),

  /** GET /api/products/:id – single product */
  getById: (id) => apiFetch(`/api/products/${id}`).then(normalizeProduct),

  /** GET /api/products/category/:category – filter by category */
  getByCategory: (category) =>
    apiFetch(`/api/products/category/${encodeURIComponent(category)}`).then((list) =>
      list.map(normalizeProduct)
    ),

  /** GET /api/products/in-stock – only in-stock products */
  getInStock: () => apiFetch('/api/products/in-stock').then((list) => list.map(normalizeProduct)),

  /** GET /api/products/search?keyword= – search by name */
  search: (keyword) =>
    apiFetch(`/api/products/search?keyword=${encodeURIComponent(keyword)}`).then((list) =>
      list.map(normalizeProduct)
    ),

  /** POST /api/products – create (ADMIN) */
  create: (data) =>
    apiFetch('/api/products', { method: 'POST', body: JSON.stringify(data) }).then(
      normalizeProduct
    ),

  /** PUT /api/products/:id – update (ADMIN) */
  update: (id, data) =>
    apiFetch(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(
      normalizeProduct
    ),

  /** DELETE /api/products/:id – delete (ADMIN) */
  delete: (id) => apiFetch(`/api/products/${id}`, { method: 'DELETE' }),
};

// ── Orders API ───────────────────────────────────────────────

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function formatOrderDate(dateString) {
  if (!dateString) return '—';
  const d = new Date(dateString);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/** Maps backend OrderResponse → frontend-friendly shape (for Track.jsx and Admin) */
function normalizeOrder(o) {
  const mainProduct = o.items && o.items.length > 0 ? o.items[0].productName : 'Custom Order';
  const productLabel = o.items && o.items.length > 1 
    ? `${mainProduct} + ${o.items.length - 1} more` 
    : mainProduct;

  return {
    ...o,
    id: `ORD-${String(o.id).padStart(4, '0')}`,
    rawId: o.id, // For API calls (e.g. cancel, update status)
    status: (o.status || 'PENDING').toLowerCase(),
    date: formatOrderDate(o.orderDate),
    amount: `EGP ${(o.totalAmount || 0).toFixed(2)}`,
    product: productLabel,
    quantity: o.totalQuantity || 0,
    rawDate: o.orderDate,
    rawAmount: o.totalAmount,
    // Admin display fields mapped from backend
    customer: o.userName || o.userUsername || o.userEmail || '—',
    email: o.userEmail || '—',
    address: o.shippingAddress || '—',
  };
}

export const orderApi = {
  /** POST /api/orders – place a new order */
  create: (data) => apiFetch('/api/orders', { method: 'POST', body: JSON.stringify(data) }).then(normalizeOrder),

  /**
   * POST /api/orders/bulk – place a bulk order (one order per recipient).
   * Returns { primaryOrderId, totalAmount, bulkGroupId, recipientCount, orderIds }
   */
  createBulk: (data) => apiFetch('/api/orders/bulk', { method: 'POST', body: JSON.stringify(data) }),

  /** GET /api/orders/me – get orders for current user */
  getMyOrders: () => apiFetch('/api/orders/me').then(list => list.map(normalizeOrder)),

  /** GET /api/orders – list all orders (ADMIN) */
  getAll: () => apiFetch('/api/orders').then(list => list.map(normalizeOrder)),

  /** GET /api/orders/:id – single order */
  getById: (id) => apiFetch(`/api/orders/${id}`).then(normalizeOrder),

  /** PUT /api/orders/:id/status – update order status (ADMIN) */
  updateStatus: (id, status) => apiFetch(`/api/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status: String(status).toUpperCase() }) }).then(normalizeOrder),

  /** PUT /api/orders/:id/cancel – cancel an order */
  cancel: (id) => apiFetch(`/api/orders/${id}/cancel`, { method: 'PUT' }).then(normalizeOrder),
};


// ── Cart API ─────────────────────────────────────────────────────────

/** Maps a backend CartItemResponse → frontend-friendly cart item shape */
function normalizeCartItem(item) {
  return {
    id: item.id,                          // backend CartItem ID — used for PUT/DELETE
    productId: String(item.productId),
    name: item.productName || '',
    image: item.productImageUrl || '',
    price: typeof item.unitPrice === 'number' ? item.unitPrice : parseFloat(item.unitPrice) || 0,
    quantity: item.quantity || 1,
    size: item.selectedSize || '',
    material: item.selectedMaterial || '',
    totalItemPrice: item.totalItemPrice || 0,
  };
}

/** Maps a backend CartResponse → { id, items[], totalPrice } */
function normalizeCart(cart) {
  return {
    id: cart.id,
    items: (cart.items || []).map(normalizeCartItem),
    totalPrice: cart.totalPrice || 0,
  };
}

export const cartApi = {
  /** GET /api/cart — get current user's cart */
  getCart: () => apiFetch('/api/cart').then(normalizeCart),

  /** POST /api/cart/items — add an item to cart */
  addItem: (productId, quantity, selectedSize, selectedMaterial, customBoxConfigId = null) =>
    apiFetch('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({
        productId: Number(productId),
        quantity,
        selectedSize: selectedSize || null,
        selectedMaterial: selectedMaterial || null,
        customBoxConfigId: customBoxConfigId ? Number(customBoxConfigId) : null,
      }),
    }).then(normalizeCart),

  /** PUT /api/cart/items/{itemId}?quantity={qty} — update item quantity */
  updateItem: (itemId, quantity) =>
    apiFetch(`/api/cart/items/${itemId}?quantity=${quantity}`, { method: 'PUT' }).then(normalizeCart),

  /** DELETE /api/cart/items/{itemId} — remove a single item */
  removeItem: (itemId) =>
    apiFetch(`/api/cart/items/${itemId}`, { method: 'DELETE' }).then(normalizeCart),

  /** DELETE /api/cart — clear entire cart (returns 204, no body) */
  clearCart: () => apiFetch('/api/cart', { method: 'DELETE' }),
};

export const shipmentApi = {
  /** GET /api/shipments/order/:orderId - Get tracking details/timeline for an order */
  getByOrderId: (orderId) => apiFetch(`/api/shipments/order/${orderId}`),

  /** GET /api/shipments/:id - Get shipment by ID */
  getById: (id) => apiFetch(`/api/shipments/${id}`),

  /** PUT /api/shipments/:id/status - Update shipment status */
  updateStatus: (id, status) => apiFetch(`/api/shipments/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  /** PUT /api/shipments/:id/assign-partner - Assign shipping partner */
  assignPartner: (id, partnerId) => apiFetch(`/api/shipments/${id}/assign-partner`, { method: 'PUT', body: JSON.stringify({ partnerId }) })
};

// ── Payment API ───────────────────────────────────────────────────────

export const paymentApi = {
  /**
   * POST /api/payment/initiate
   * Kicks off the Paymob 3-step flow on the backend.
   * Returns { iframeUrl, paymentKey, paymobOrderId }.
   *
   * @param {number} orderId      - Internal Packora order ID
   * @param {number} amount       - Total in EGP
   * @param {object} billingData  - Buyer info required by Paymob
   */
  initiate: (orderId, amount, billingData) =>
    apiFetch('/api/payment/initiate', {
      method: 'POST',
      body: JSON.stringify({ orderId, amount, billingData }),
    }),
};

// ── Packaging Customization API ───────────────────────────────────────

/** Maps backend PackagingResponse → frontend-friendly shape */
function normalizePackaging(p) {
  return {
    ...p,
    id: String(p.id),
    price: typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0,
    type: p.type || '',
    material: p.material || '',
    size: p.size || '',
    color: p.color || '',
    designId: p.designId ?? null,
    partnerId: p.partnerId ?? null,  // NOTE: partnerId UI is intentionally skipped
  };
}

export const packagingApi = {
  /** GET /api/packagings — list all packaging configs (public) */
  getAll: () => apiFetch('/api/packagings').then((list) => list.map(normalizePackaging)),

  /** GET /api/packagings/{id} — get single packaging (public) */
  getById: (id) => apiFetch(`/api/packagings/${id}`).then(normalizePackaging),

  /** GET /api/packagings/type/{type} — filter by type (public) */
  getByType: (type) =>
    apiFetch(`/api/packagings/type/${encodeURIComponent(type)}`).then((list) =>
      list.map(normalizePackaging)
    ),

  /**
   * GET /api/packagings/partner/{partnerId} — filter by partner (public)
   * NOTE: Mapped for completeness — no UI is built for this (partner UI skipped).
   */
  getByPartner: (partnerId) =>
    apiFetch(`/api/packagings/partner/${partnerId}`).then((list) =>
      list.map(normalizePackaging)
    ),

  /** POST /api/packagings — create a packaging config (ADMIN only) */
  create: (data) =>
    apiFetch('/api/packagings', { method: 'POST', body: JSON.stringify(data) }).then(
      normalizePackaging
    ),

  /** PUT /api/packagings/{id} — update a packaging config (ADMIN only) */
  update: (id, data) =>
    apiFetch(`/api/packagings/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(
      normalizePackaging
    ),

  /** DELETE /api/packagings/{id} — delete a packaging config (ADMIN only, returns 204) */
  delete: (id) => apiFetch(`/api/packagings/${id}`, { method: 'DELETE' }),

  /**
   * POST /api/packagings/quote — calculate a packaging quote (public)
   * Body: { material, width, height, length, quantity, color?, type? }
   * Returns: { unitPrice, totalPrice, currency, quantity, breakdown }
   */
  quote: (data) =>
    apiFetch('/api/packagings/quote', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Admin Analytics API ───────────────────────────────────────────────

export const adminAnalyticsApi = {
  /** GET /api/admin/analytics/dashboard — full dashboard stats (ADMIN only) */
  getDashboard: () =>
    apiFetch('/api/admin/analytics/dashboard').then((data) => ({
      ...data,
      recentOrders: (data.recentOrders || []).map(normalizeOrder),
    })),

  /** GET /api/admin/analytics/revenue-chart?months={m} — (ADMIN only) */
  getRevenueChart: (months = 6) =>
    apiFetch(`/api/admin/analytics/revenue-chart?months=${months}`),

  /** GET /api/admin/analytics/top-products?limit={l} — (ADMIN only) */
  getTopProducts: (limit = 5) =>
    apiFetch(`/api/admin/analytics/top-products?limit=${limit}`),
};

// ── Designs API (Partner Assets) ──────────────────────────────────────

export const designApi = {
  /** GET /api/designs - List all designs */
  getAll: () => apiFetch('/api/designs'),

  /** GET /api/designs/{id} - Get design by ID */
  getById: (id) => apiFetch(`/api/designs/${id}`),

  /** POST /api/designs - Create design */
  create: (partnerId, logoFile, artworkFile, previewUrl) => {
    const formData = new FormData();
    formData.append('partnerId', partnerId);
    if (logoFile) formData.append('logoFile', logoFile);
    if (artworkFile) formData.append('artworkFile', artworkFile);
    if (previewUrl) formData.append('previewUrl', previewUrl);
    
    return apiFetch('/api/designs', {
      method: 'POST',
      body: formData,
    });
  },

  /** PUT /api/designs/{id} - Update design files/metadata */
  update: (id, logoFile, artworkFile, previewUrl) => {
    const formData = new FormData();
    if (logoFile) formData.append('logoFile', logoFile);
    if (artworkFile) formData.append('artworkFile', artworkFile);
    if (previewUrl) formData.append('previewUrl', previewUrl);

    return apiFetch(`/api/designs/${id}`, {
      method: 'PUT',
      body: formData,
    });
  },

  /** DELETE /api/designs/{id} - Delete design and its files */
  delete: (id) => apiFetch(`/api/designs/${id}`, { method: 'DELETE' }),
};

// ── Custom Box Config API (End-User 3D Editor) ────────────────────────

export const customBoxConfigApi = {
  /** POST /api/custom-boxes - Create new config draft */
  create: (configurationJson, isSavedDraft = false) => 
    apiFetch('/api/custom-boxes', {
      method: 'POST',
      body: JSON.stringify({ configurationJson, isSavedDraft })
    }),

  /** PUT /api/custom-boxes/{id} - Update existing config draft */
  update: (id, configurationJson, isSavedDraft = false) => 
    apiFetch(`/api/custom-boxes/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ configurationJson, isSavedDraft })
    }),

  /** GET /api/custom-boxes/me - Get my saved drafts */
  getMyDrafts: () => apiFetch('/api/custom-boxes/me'),
};
