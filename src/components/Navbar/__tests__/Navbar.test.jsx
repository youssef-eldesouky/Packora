import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ── Mock all context providers BEFORE importing Navbar ────────────────
jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    logout: jest.fn(),
  }),
}));

jest.mock('../../../context/CartContext', () => ({
  useCart: () => ({ cartItems: [] }),
}));

jest.mock('../../../context/AdminAuthContext', () => ({
  useAdminAuth: () => ({ logoutAdmin: jest.fn() }),
}));

import Navbar from '../Navbar';

// ── Tests ─────────────────────────────────────────────────────────────
describe('Navbar', () => {
  test('renders the Packora brand name', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    expect(screen.getByText('Packora')).toBeInTheDocument();
  });

  test('renders all main nav links', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Catalog')).toBeInTheDocument();
    expect(screen.getByText('Create New Box')).toBeInTheDocument();
    expect(screen.getByText('Track')).toBeInTheDocument();
    expect(screen.getByText('Cart')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
  });

  test('shows Login link when user is not logged in', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  test('does NOT show Logout button when not logged in', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  test('does NOT show Profile link when not logged in', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();
  });
});
