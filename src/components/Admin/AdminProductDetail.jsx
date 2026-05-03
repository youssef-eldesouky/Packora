import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { formatMoneyDecimal } from '../../utils/adminFormat';

export default function AdminProductDetail() {
  const { productId } = useParams();
  const { products } = useAdmin();

  const product = useMemo(() => products.find((p) => String(p.id) === String(productId)), [products, productId]);

  if (!product) {
    return (
      <>
        <Link to="/admin/products" className="admin-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1rem' }}>
          <ArrowLeft size={16} />
          Back to products
        </Link>
        <h1 className="admin-page-title">Product not found</h1>
        <p className="admin-page-sub">This product may have been removed.</p>
      </>
    );
  }

  return (
    <>
      <Link to="/admin/products" className="admin-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1rem' }}>
        <ArrowLeft size={16} />
        All products
      </Link>
      <div className="admin-dash-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '1rem' }}>
        <div className="admin-product-card" style={{ maxWidth: '420px' }}>
          <div className="admin-product-img-wrap">
            <img src={product.image} alt="" />
          </div>
        </div>
        <div>
          <h1 className="admin-page-title" style={{ marginTop: 0 }}>
            {product.name}
          </h1>
          <p className="admin-product-price" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
            {formatMoneyDecimal(product.price)}
          </p>
          <span className="admin-tag" style={{ marginBottom: '1rem', display: 'inline-block' }}>
            {product.category}
          </span>
          <p className="admin-page-sub" style={{ marginTop: '1rem' }}>
            {product.description}
          </p>
          <ul style={{ paddingLeft: '1.2rem', color: 'var(--admin-muted)', fontSize: '0.9rem' }}>
            <li>Stock: {product.stock}</li>
            <li>Minimum order: {product.minOrder} units</li>
          </ul>
          <Link to="/admin/products" state={{ editProductId: product.id }} className="admin-btn admin-btn-primary" style={{ marginTop: '1rem', textDecoration: 'none', display: 'inline-flex' }}>
            <Pencil size={18} />
            Edit in catalog
          </Link>
        </div>
      </div>
    </>
  );
}
