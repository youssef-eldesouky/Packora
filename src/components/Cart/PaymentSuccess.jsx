import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package } from 'lucide-react';
import './PaymentResult.css';

/**
 * PaymentSuccess — shown after a successful Paymob transaction.
 *
 * Paymob redirects the browser to:
 *   GET /api/payment/callback?success=true&id=<txnId>
 *
 * Our backend then redirects to:
 *   http://localhost:3000/payment/success?txn=<txnId>
 *
 * This component reads the ?txn= param for display purposes.
 */
export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const txnId     = params.get('txn');

  // Auto-redirect to Track after 5 seconds
  const [countdown, setCountdown] = useState(5);
  useEffect(() => {
    if (countdown <= 0) {
      navigate('/Track');
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  return (
    <div className="payment-result-page payment-result-success">
      <div className="payment-result-card">
        <div className="payment-result-icon success">
          <CheckCircle size={64} />
        </div>
        <h1 className="payment-result-title">Payment Successful!</h1>
        <p className="payment-result-msg">
          Your order has been placed and payment confirmed.
          Our team will start processing it shortly.
        </p>
        {txnId && (
          <p className="payment-result-ref">
            Transaction Reference: <strong>{txnId}</strong>
          </p>
        )}
        <p className="payment-result-countdown">
          Redirecting to your orders in <strong>{countdown}s</strong>…
        </p>
        <button
          className="payment-result-btn"
          onClick={() => navigate('/Track')}
        >
          <Package size={18} /> View My Orders
        </button>
      </div>
    </div>
  );
}
