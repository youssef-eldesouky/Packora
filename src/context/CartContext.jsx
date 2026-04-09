import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: 'John Doe',
    company: 'Your Business Inc.',
    street: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    phone: '(555) 123-4567',
  });
  const [paymentMethods, setPaymentMethods] = useState([
    { id: '1', last4: '4242', name: 'John Smith', expMonth: 12, expYear: 2025, isDefault: true },
  ]);
  const [selectedPaymentId, setSelectedPaymentId] = useState('1');
  const [checkoutStep, setCheckoutStep] = useState('shipping'); // shipping | payment | review

  const addToCart = (item) => {
    const key = `${item.productId}-${item.size || ''}-${item.material || ''}`;
    setCartItems((prev) => {
      const found = prev.find((i) => `${i.productId}-${i.size || ''}-${i.material || ''}` === key);
      if (found) {
        return prev.map((i) =>
          i === found ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i
        );
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  };

  const removeFromCart = (productId, size, material) => {
    const key = `${productId}-${size || ''}-${material || ''}`;
    setCartItems((prev) => prev.filter((i) => `${i.productId}-${i.size || ''}-${i.material || ''}` !== key));
  };

  const updateQuantity = (productId, size, material, quantity) => {
    const key = `${productId}-${size || ''}-${material || ''}`;
    setCartItems((prev) =>
      prev.map((i) =>
        `${i.productId}-${i.size || ''}-${i.material || ''}` === key ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => setCartItems([]);

  const addPaymentMethod = (card) => {
    const id = String(Date.now());
    setPaymentMethods((prev) => {
      const newCard = { ...card, id, isDefault: prev.length === 0 };
      return [...prev, newCard];
    });
    setSelectedPaymentId(id);
  };

  const removePaymentMethod = (id) => {
    setPaymentMethods((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (selectedPaymentId === id) {
        setSelectedPaymentId(next[0]?.id || null);
      }
      if (next.length && !next.some((c) => c.isDefault)) {
        return next.map((c, i) => ({ ...c, isDefault: i === 0 }));
      }
      return next;
    });
  };

  const setDefaultPaymentMethod = (id) => {
    setPaymentMethods((prev) =>
      prev.map((c) => ({ ...c, isDefault: c.id === id }))
    );
    setSelectedPaymentId(id);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    shippingAddress,
    setShippingAddress,
    paymentMethods,
    selectedPaymentId,
    setSelectedPaymentId,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    checkoutStep,
    setCheckoutStep,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
