import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PaymentSuccess from '../PaymentSuccess';

// ── Helper ────────────────────────────────────────────────────────────
function renderPaymentSuccess(searchParams = '') {
  return render(
    <MemoryRouter initialEntries={[`/payment/success${searchParams}`]}>
      <Routes>
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/Track" element={<div>Track Page</div>} />
        <Route path="/Catalog" element={<div>Catalog Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────
describe('PaymentSuccess', () => {
  test('renders "Payment Successful!" heading', () => {
    renderPaymentSuccess();
    expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
  });

  test('renders success message body text', () => {
    renderPaymentSuccess();
    expect(
      screen.getByText(/Your order has been placed and payment confirmed/i)
    ).toBeInTheDocument();
  });

  test('shows "View My Orders" button', () => {
    renderPaymentSuccess();
    expect(screen.getByRole('button', { name: /View My Orders/i })).toBeInTheDocument();
  });

  test('shows "Continue Shopping" button', () => {
    renderPaymentSuccess();
    expect(screen.getByRole('button', { name: /Continue Shopping/i })).toBeInTheDocument();
  });

  test('displays transaction ID when txn param is provided', () => {
    renderPaymentSuccess('?txn=TXN-12345');
    expect(screen.getByText('TXN-12345')).toBeInTheDocument();
    expect(screen.getByText(/Transaction Reference/i)).toBeInTheDocument();
  });

  test('does NOT show transaction reference when txn param is absent', () => {
    renderPaymentSuccess();
    expect(screen.queryByText(/Transaction Reference/i)).not.toBeInTheDocument();
  });

  test('navigates to Track page when "View My Orders" is clicked', async () => {
    renderPaymentSuccess();
    await userEvent.click(screen.getByRole('button', { name: /View My Orders/i }));
    expect(screen.getByText('Track Page')).toBeInTheDocument();
  });

  test('navigates to Catalog page when "Continue Shopping" is clicked', async () => {
    renderPaymentSuccess();
    await userEvent.click(screen.getByRole('button', { name: /Continue Shopping/i }));
    expect(screen.getByText('Catalog Page')).toBeInTheDocument();
  });
});
