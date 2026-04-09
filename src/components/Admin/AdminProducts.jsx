import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { formatMoneyDecimal } from '../../utils/adminFormat';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  category: 'Boxes',
  minOrder: '100',
  stock: '0',
  image: '',
};

export default function AdminProducts() {
  const { products, addProduct, updateProduct, removeProduct } = useAdmin();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    setQ(searchParams.get('q') ?? '');
  }, [searchParams]);

  useEffect(() => {
    const id = location.state?.editProductId;
    if (!id) return;
    const p = products.find((x) => String(x.id) === String(id));
    if (p) {
      setForm({
        name: p.name,
        description: p.description,
        price: String(p.price),
        category: p.category,
        minOrder: String(p.minOrder),
        stock: String(p.stock),
        image: p.image || '',
      });
      setModal({ mode: 'edit', id: p.id });
    }
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, location.pathname, navigate, products]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
    );
  }, [products, q]);

  function openAdd() {
    setForm(emptyForm);
    setModal('add');
  }

  function openEdit(p) {
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      category: p.category,
      minOrder: String(p.minOrder),
      stock: String(p.stock),
      image: p.image || '',
    });
    setModal({ mode: 'edit', id: p.id });
  }

  function submit(e) {
    e.preventDefault();
    if (modal === 'add') {
      addProduct(form);
    } else if (modal?.mode === 'edit') {
      updateProduct(modal.id, {
        name: form.name,
        description: form.description,
        price: form.price,
        category: form.category,
        minOrder: form.minOrder,
        stock: form.stock,
        image: form.image || undefined,
      });
    }
    setModal(null);
  }

  return (
    <>
      <h1 className="admin-page-title">Manage Products</h1>
      <p className="admin-page-sub">Add, edit, or remove products from your catalog.</p>

      <div className="admin-toolbar">
        <div className="admin-search-wrap">
          <Search size={18} />
          <input
            className="admin-search"
            placeholder="Search products..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search products"
          />
        </div>
        <button type="button" className="admin-btn admin-btn-primary" onClick={openAdd}>
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="admin-products-grid">
        {filtered.map((p) => (
          <article key={p.id} className="admin-product-card">
            <div className="admin-product-img-wrap">
              <img src={p.image} alt="" />
              <div className="admin-product-actions">
                <button
                  type="button"
                  className="admin-icon-btn"
                  aria-label="Edit product"
                  onClick={() => openEdit(p)}
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  className="admin-icon-btn danger"
                  aria-label="Delete product"
                  onClick={() => {
                    if (window.confirm(`Remove “${p.name}” from the catalog?`)) removeProduct(p.id);
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="admin-product-body">
              <div className="admin-product-title-row">
                <h3>
                  <Link to={`/admin/products/${p.id}`} className="admin-link" style={{ color: 'inherit', textDecoration: 'none' }}>
                    {p.name}
                  </Link>
                </h3>
                <span className="admin-product-price">{formatMoneyDecimal(p.price)}</span>
              </div>
              <p className="admin-product-desc">{p.description}</p>
              <div className="admin-product-foot">
                <span>
                  Stock: {p.stock}
                  <br />
                  Min. Order: {p.minOrder} units
                </span>
                <span className="admin-tag">{p.category}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {modal && (
        <div
          className="admin-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-modal-title"
          onClick={(e) => e.target === e.currentTarget && setModal(null)}
        >
          <div className="admin-modal">
            <h3 id="product-modal-title">{modal === 'add' ? 'Add Product' : 'Edit Product'}</h3>
            <form onSubmit={submit}>
              <div className="admin-form-row">
                <label htmlFor="p-name">Name</label>
                <input
                  id="p-name"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="admin-form-row">
                <label htmlFor="p-desc">Description</label>
                <textarea
                  id="p-desc"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="admin-form-row">
                <label htmlFor="p-price">Price (USD)</label>
                <input
                  id="p-price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                />
              </div>
              <div className="admin-form-row">
                <label htmlFor="p-cat">Category</label>
                <select
                  id="p-cat"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                >
                  <option value="Boxes">Boxes</option>
                  <option value="Eco-Friendly">Eco-Friendly</option>
                  <option value="Protective">Protective</option>
                  <option value="Mailers">Mailers</option>
                  <option value="Supplies">Supplies</option>
                </select>
              </div>
              <div className="admin-form-row">
                <label htmlFor="p-stock">Stock</label>
                <input
                  id="p-stock"
                  type="number"
                  min="0"
                  required
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                />
              </div>
              <div className="admin-form-row">
                <label htmlFor="p-min">Minimum order (units)</label>
                <input
                  id="p-min"
                  type="number"
                  min="1"
                  required
                  value={form.minOrder}
                  onChange={(e) => setForm((f) => ({ ...f, minOrder: e.target.value }))}
                />
              </div>
              <div className="admin-form-row">
                <label htmlFor="p-img">Image URL (optional)</label>
                <input
                  id="p-img"
                  type="url"
                  placeholder="https://..."
                  value={form.image}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                />
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
