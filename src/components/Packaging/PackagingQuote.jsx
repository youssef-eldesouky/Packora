import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Calculator,
  Package,
  Loader2,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import { packagingApi } from '../../utils/api';
import './PackagingQuote.css';

const MATERIALS = ['Corrugated', 'Kraft', 'Cardboard', 'Plastic', 'Foam', 'Bubble Wrap'];
const TYPES = ['Box', 'Mailer', 'Pouch', 'Paper Bag', 'Tube', 'Tray'];
const COLORS = ['', 'White', 'Brown Kraft', 'Black', 'Navy', 'Red', 'Custom'];

export default function PackagingQuote() {
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    material: searchParams.get('material') || MATERIALS[0],
    width: searchParams.get('width') || '',
    height: searchParams.get('height') || '',
    length: searchParams.get('length') || '',
    quantity: searchParams.get('quantity') || '',
    color: searchParams.get('color') || '',
    type: searchParams.get('type') || '',
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = {
        material: form.material,
        width: parseFloat(form.width),
        height: parseFloat(form.height),
        length: parseFloat(form.length),
        quantity: parseInt(form.quantity, 10),
        color: form.color || undefined,
        type: form.type || undefined,
      };
      const data = await packagingApi.quote(payload);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to calculate quote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isValid =
    form.material &&
    form.width && !isNaN(parseFloat(form.width)) && parseFloat(form.width) > 0 &&
    form.height && !isNaN(parseFloat(form.height)) && parseFloat(form.height) > 0 &&
    form.length && !isNaN(parseFloat(form.length)) && parseFloat(form.length) > 0 &&
    form.quantity && !isNaN(parseInt(form.quantity, 10)) && parseInt(form.quantity, 10) > 0;

  const breakdownLabels = {
    baseMaterialCost: 'Base Material Cost',
    surfaceAreaMultiplier: 'Surface Area Multiplier',
    colorSurcharge: 'Color Surcharge',
    volumeDiscount: 'Volume Discount',
  };

  return (
    <div className="pquote-page">
      <Navbar />

      <main className="pquote-main">
        <div className="pquote-hero">
          <div className="pquote-hero-icon">
            <Calculator size={32} />
          </div>
          <h1 className="pquote-title">Packaging Quote Calculator</h1>
          <p className="pquote-subtitle">
            Get an instant price estimate for your custom packaging order based on material,
            dimensions, and quantity.
          </p>
        </div>

        <div className="pquote-layout">
          {/* ── Form ── */}
          <form className="pquote-form" onSubmit={handleSubmit}>
            <div className="pquote-card">
              <h2 className="pquote-section-title">
                <Package size={18} />
                Packaging Specs
              </h2>

              {/* Type (optional) */}
              <div className="pquote-field">
                <label className="pquote-label">Packaging Type <span className="pquote-optional">(optional)</span></label>
                <select name="type" value={form.type} onChange={handleChange} className="pquote-input">
                  <option value="">— Select type —</option>
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Material (required) */}
              <div className="pquote-field">
                <label className="pquote-label">Material <span className="pquote-required">*</span></label>
                <select name="material" value={form.material} onChange={handleChange} className="pquote-input" required>
                  {MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {/* Color (optional) */}
              <div className="pquote-field">
                <label className="pquote-label">Color <span className="pquote-optional">(optional — adds surcharge)</span></label>
                <select name="color" value={form.color} onChange={handleChange} className="pquote-input">
                  {COLORS.map((c) => <option key={c} value={c}>{c || '— No custom color —'}</option>)}
                </select>
              </div>

              <h2 className="pquote-section-title" style={{ marginTop: '1.5rem' }}>
                Dimensions (cm)
              </h2>

              <div className="pquote-dims">
                {[
                  { name: 'width', label: 'Width' },
                  { name: 'height', label: 'Height' },
                  { name: 'length', label: 'Length' },
                ].map(({ name, label }) => (
                  <div key={name} className="pquote-field">
                    <label className="pquote-label">{label} <span className="pquote-required">*</span></label>
                    <input
                      type="number"
                      name={name}
                      value={form[name]}
                      onChange={handleChange}
                      className="pquote-input"
                      placeholder="e.g. 30"
                      min="0.1"
                      step="0.1"
                      required
                    />
                  </div>
                ))}
              </div>

              {/* Quantity */}
              <div className="pquote-field">
                <label className="pquote-label">Quantity (units) <span className="pquote-required">*</span></label>
                <input
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  className="pquote-input"
                  placeholder="e.g. 1000"
                  min="1"
                  step="1"
                  required
                />
              </div>

              <button
                type="submit"
                className="pquote-submit"
                disabled={loading || !isValid}
              >
                {loading ? (
                  <><Loader2 size={18} className="pquote-spinner" /> Calculating…</>
                ) : (
                  <><Calculator size={18} /> Calculate Quote</>
                )}
              </button>
            </div>
          </form>

          {/* ── Result panel ── */}
          <div className="pquote-result-panel">
            {error && (
              <div className="pquote-error">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {!result && !error && (
              <div className="pquote-placeholder">
                <Package size={48} className="pquote-placeholder-icon" />
                <p>Fill in the form and click <strong>Calculate Quote</strong> to see your pricing estimate.</p>
              </div>
            )}

            {result && (
              <div className="pquote-card pquote-result">
                <h2 className="pquote-section-title">Your Quote</h2>

                <div className="pquote-price-grid">
                  <div className="pquote-price-box pquote-unit">
                    <span className="pquote-price-label">Unit Price</span>
                    <span className="pquote-price-value">
                      {result.currency || 'EGP'} {result.unitPrice?.toFixed(2)}
                    </span>
                  </div>
                  <div className="pquote-price-box pquote-total">
                    <span className="pquote-price-label">Total ({result.quantity?.toLocaleString()} units)</span>
                    <span className="pquote-price-value pquote-total-value">
                      {result.currency || 'EGP'} {result.totalPrice?.toFixed(2)}
                    </span>
                  </div>
                </div>

                {result.breakdown && Object.keys(result.breakdown).length > 0 && (
                  <div className="pquote-breakdown">
                    <h3 className="pquote-breakdown-title">Cost Breakdown</h3>
                    <table className="pquote-breakdown-table">
                      <tbody>
                        {Object.entries(result.breakdown).map(([key, val]) => (
                          <tr key={key}>
                            <td className="pquote-breakdown-key">
                              {breakdownLabels[key] || key}
                            </td>
                            <td className="pquote-breakdown-val">{val}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <Link to="/Catalog" className="pquote-cta">
                  Browse Packaging Catalog
                  <ChevronRight size={16} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
