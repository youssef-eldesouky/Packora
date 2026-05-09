import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Search, Plus, Pencil, Trash2, Loader2, Archive } from 'lucide-react';
import { packagingApi } from '../../utils/api';
import { formatMoneyDecimal } from '../../utils/adminFormat';

const PACKAGING_TYPES = ['All', 'Box', 'Mailer', 'Pouch', 'Paper Bag', 'Tube', 'Tray'];
const MATERIALS = ['Corrugated', 'Kraft', 'Cardboard', 'Plastic', 'Foam', 'Bubble Wrap'];

const emptyForm = {
  type: 'Box',
  material: 'Corrugated',
  size: '',
  color: '',
  price: '',
  designId: '',
  // NOTE: partnerId is intentionally omitted from the UI (partner management skipped)
};

function PackagingModal({ mode, initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        type: form.type,
        material: form.material || null,
        size: form.size || null,
        color: form.color || null,
        price: parseFloat(form.price),
        designId: form.designId ? Number(form.designId) : null,
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="admin-modal" style={{ maxWidth: 480 }}>
        <h2 className="admin-modal-title">
          <Archive size={20} />
          {mode === 'add' ? 'Add Packaging' : 'Edit Packaging'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-row">
            <label className="admin-form-label">Type *</label>
            <select name="type" value={form.type} onChange={handleChange} className="admin-input" required>
              {PACKAGING_TYPES.filter(t => t !== 'All').map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="admin-form-row">
            <label className="admin-form-label">Material</label>
            <select name="material" value={form.material} onChange={handleChange} className="admin-input">
              <option value="">— None —</option>
              {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="admin-form-row">
            <label className="admin-form-label">Size (e.g. 30×20×15 cm)</label>
            <input
              type="text"
              name="size"
              value={form.size}
              onChange={handleChange}
              className="admin-input"
              placeholder="e.g. 30x20x15"
            />
          </div>

          <div className="admin-form-row">
            <label className="admin-form-label">Color</label>
            <input
              type="text"
              name="color"
              value={form.color}
              onChange={handleChange}
              className="admin-input"
              placeholder="e.g. Kraft, White, Custom"
            />
          </div>

          <div className="admin-form-row">
            <label className="admin-form-label">Price (EGP) *</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              className="admin-input"
              placeholder="e.g. 2.50"
              min="0.01"
              step="0.01"
              required
            />
          </div>

          <div className="admin-form-row">
            <label className="admin-form-label">Design ID <span style={{ color: 'var(--admin-muted)', fontWeight: 400 }}>(optional)</span></label>
            <input
              type="number"
              name="designId"
              value={form.designId}
              onChange={handleChange}
              className="admin-input"
              placeholder="Link to a design (optional)"
              min="1"
            />
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{error}</p>}

          <div className="admin-modal-actions">
            <button type="button" className="admin-btn" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
              {saving ? <Loader2 size={16} className="profile-spinner" /> : null}
              {saving ? 'Saving…' : mode === 'add' ? 'Add Packaging' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminPackagings() {
  const [packagings, setPackagings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [modal, setModal] = useState(null); // { mode: 'add' | 'edit', data?: packaging }
  const [deleting, setDeleting] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await packagingApi.getAll();
      setPackagings(data);
    } catch (err) {
      setError(err.message || 'Failed to load packagings.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByType = useCallback(async (type) => {
    setLoading(true);
    setError(null);
    try {
      const data = await packagingApi.getByType(type);
      setPackagings(data);
    } catch (err) {
      setError(err.message || 'Failed to load packagings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeFilter === 'All') {
      fetchAll();
    } else {
      fetchByType(typeFilter);
    }
  }, [typeFilter, fetchAll, fetchByType]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return packagings;
    return packagings.filter(
      (p) =>
        (p.type || '').toLowerCase().includes(term) ||
        (p.material || '').toLowerCase().includes(term) ||
        (p.size || '').toLowerCase().includes(term) ||
        (p.color || '').toLowerCase().includes(term)
    );
  }, [packagings, q]);

  const handleSave = async (payload) => {
    if (modal.mode === 'add') {
      const created = await packagingApi.create(payload);
      setPackagings((prev) => [...prev, created]);
    } else {
      const updated = await packagingApi.update(modal.data.id, payload);
      setPackagings((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this packaging configuration? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await packagingApi.delete(id);
      setPackagings((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <div>
          <h1 className="admin-page-title" style={{ margin: 0 }}>Packagings</h1>
          <p className="admin-page-sub">Manage packaging configurations for the catalog.</p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={() => setModal({ mode: 'add' })}
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <Plus size={16} /> Add Packaging
        </button>
      </div>

      {/* Type filter tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {PACKAGING_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            className={`admin-btn ${typeFilter === t ? 'admin-btn-primary' : ''}`}
            style={{ padding: '0.3rem 0.7rem', fontSize: '0.82rem' }}
            onClick={() => setTypeFilter(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="admin-search-bar" style={{ marginBottom: '1rem' }}>
        <Search size={16} />
        <input
          type="text"
          placeholder="Search by type, material, size…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="admin-search-input"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="admin-loading">
          <Loader2 size={28} className="profile-spinner" />
          <p>Loading packagings…</p>
        </div>
      ) : error ? (
        <div className="admin-error-msg">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty">
          <Archive size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
          <p>No packaging configurations found.</p>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() => setModal({ mode: 'add' })}
          >
            <Plus size={16} /> Add First Packaging
          </button>
        </div>
      ) : (
        <div className="admin-card" style={{ padding: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Material</th>
                <th>Size</th>
                <th>Color</th>
                <th>Price</th>
                <th>Design ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((pkg) => (
                <tr key={pkg.id}>
                  <td style={{ color: 'var(--admin-muted)', fontSize: '0.8rem' }}>#{pkg.id}</td>
                  <td><span className="admin-badge">{pkg.type}</span></td>
                  <td>{pkg.material || '—'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.88rem' }}>{pkg.size || '—'}</td>
                  <td>{pkg.color || '—'}</td>
                  <td style={{ fontWeight: 600 }}>{formatMoneyDecimal(pkg.price)}</td>
                  <td style={{ color: 'var(--admin-muted)', fontSize: '0.85rem' }}>{pkg.designId ?? '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        className="admin-btn admin-btn-icon"
                        title="Edit"
                        onClick={() => setModal({
                          mode: 'edit',
                          data: pkg,
                        })}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-icon admin-btn-danger"
                        title="Delete"
                        onClick={() => handleDelete(pkg.id)}
                        disabled={deleting === pkg.id}
                      >
                        {deleting === pkg.id
                          ? <Loader2 size={15} className="profile-spinner" />
                          : <Trash2 size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <PackagingModal
          mode={modal.mode}
          initial={
            modal.mode === 'edit' && modal.data
              ? {
                  type: modal.data.type || 'Box',
                  material: modal.data.material || '',
                  size: modal.data.size || '',
                  color: modal.data.color || '',
                  price: String(modal.data.price ?? ''),
                  designId: modal.data.designId ? String(modal.data.designId) : '',
                }
              : emptyForm
          }
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
