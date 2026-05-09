import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, RotateCcw, ShoppingCart } from 'lucide-react';
import './PaymentResult.css';

/**
 * PaymentFailed — shown after a failed/declined Paymob transaction.
 *
 * Paymob redirects to:
 *   GET /api/payment/callback?success=false&id=<txnId>
 *
 * Our backend redirects to:
 *   http://localhost:3000/payment/failed?txn=<txnId>
 *
 * The order status remains PENDING so the user can retry payment.
 */
export default function PaymentFailed() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const txnId = params.get('txn');

  return (
    <div className="payment-result-page payment-result-failed">
      <div className="payment-result-card">
        <div className="payment-result-icon failed">
          <XCircle size={64} />
        </div>
        <h1 className="payment-result-title">Payment Failed</h1>
        <p className="payment-result-msg">
          Your payment could not be processed. This may be due to insufficient
          funds, an incorrect card number, or a bank decline.
          Your order has been saved — you can retry payment below.
        </p>
        {txnId && (
          <p className="payment-result-ref">
            Transaction Reference: <strong>{txnId}</strong>
          </p>
        )}
        <div className="payment-result-actions">
          <button
            className="payment-result-btn retry"
            onClick={() => navigate('/Cart/checkout')}
          >
            <RotateCcw size={18} /> Try Again
          </button>
          <button
            className="payment-result-btn secondary"
            onClick={() => navigate('/Track')}
          >
            <ShoppingCart size={18} /> View Orders
          </button>
        </div>
      </div>
    </div>
  );
}
