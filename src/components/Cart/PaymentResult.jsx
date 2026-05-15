import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, RotateCcw, Package } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './PaymentResult.css';

/**
 * PaymentResult — The final step of checkout (Step 3).
 * This component is actually the
 * **Payment Result Screen** — it shows success or failure after Paymob
 * redirects the user back to /Cart/checkout?step=review.
 * A future rename to `PaymentResultStep` or `OrderConfirmation` would
 * better reflect what this component does.
 */
export default function PaymentResult() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { clearCart, setCheckoutStep } = useCart();
  
  const success = params.get('success') === 'true';
  const txnId   = params.get('txn');
  
  const cleared = useRef(false);

  useEffect(() => {
    // Only clear the cart once upon successful payment
    if (success && !cleared.current) {
      clearCart();
      cleared.current = true;
    }
  }, [success, clearCart]);

  if (!success) {
    return (
      <div className="payment-result-card" style={{ margin: '0 auto' }}>
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
            onClick={() => setCheckoutStep('payment')}
          >
            <RotateCcw size={18} /> Try Again
          </button>
          <button
            className="payment-result-btn secondary"
            onClick={() => navigate('/Track')}
          >
            <Package size={18} /> View Orders
          </button>
        </div>
      </div>
    );
  }

  // Success view
  return (
    <div className="payment-result-card" style={{ margin: '0 auto' }}>
      <div className="payment-result-icon success">
        <CheckCircle size={64} />
      </div>
      <h1 className="payment-result-title">Payment Successful!</h1>
      <p className="payment-result-msg">
        Your order has been placed successfully and payment confirmed.
        You can review the full details of your order in your dashboard.
        Our team will start processing it shortly.
      </p>
      {txnId && (
        <p className="payment-result-ref">
          Transaction Reference: <strong>{txnId}</strong>
        </p>
      )}
      <div className="payment-result-actions" style={{ marginTop: '2rem' }}>
        <button
          className="payment-result-btn"
          onClick={() => navigate('/Track')}
        >
          <Package size={18} /> Review Order Details
        </button>
      </div>
    </div>
  );
}
