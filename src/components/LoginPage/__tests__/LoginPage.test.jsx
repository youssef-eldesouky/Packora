import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// ── Mocks ─────────────────────────────────────────────────────────────
jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ login: jest.fn() }),
}));

jest.mock('../../../context/ProfileContext', () => ({
  useProfile: () => ({ setAccountProfile: jest.fn() }),
}));

import LoginPage from '../LoginPage';

// ── Helper ────────────────────────────────────────────────────────────
function renderLogin() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────
describe('LoginPage', () => {
  afterEach(() => {
    if (global.fetch?.mockRestore) {
      global.fetch.mockRestore();
    }
    jest.restoreAllMocks();
  });

  test('renders the page title "Welcome Back"', () => {
    renderLogin();
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });

  test('renders subtitle text', () => {
    renderLogin();
    expect(screen.getByText(/Sign in to your Packora account/i)).toBeInTheDocument();
  });

  test('renders email and password input fields', () => {
    renderLogin();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  test('renders the Sign In button', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  test('renders "Forgot password?" link', () => {
    renderLogin();
    expect(screen.getByText(/Forgot password/i)).toBeInTheDocument();
  });

  test('renders "Create one now" sign-up link', () => {
    renderLogin();
    expect(screen.getByText(/Create one now/i)).toBeInTheDocument();
  });

  test('renders Remember me checkbox', () => {
    renderLogin();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  test('email input accepts typed text', async () => {
    renderLogin();
    const emailInput = screen.getByLabelText(/Email Address/i);
    await userEvent.type(emailInput, 'test@example.com');
    expect(emailInput.value).toBe('test@example.com');
  });

  test('password input accepts typed text', async () => {
    renderLogin();
    const passwordInput = screen.getByLabelText(/Password/i);
    await userEvent.type(passwordInput, 'mypassword');
    expect(passwordInput.value).toBe('mypassword');
  });

  test('shows "Signing in..." when form is submitted', async () => {
    // Mock fetch to return a pending promise so loading state is visible
    global.fetch = jest.fn(() => new Promise(() => {}));

    renderLogin();
    await userEvent.type(screen.getByLabelText(/Email Address/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    expect(screen.getByRole('button', { name: /Signing in/i })).toBeInTheDocument();
  });

  test('shows error message on failed login', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid email or password.' }),
      })
    );

    renderLogin();
    await userEvent.type(screen.getByLabelText(/Email Address/i), 'wrong@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
    });
  });

  test('shows connection error when fetch throws', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

    renderLogin();
    await userEvent.type(screen.getByLabelText(/Email Address/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Could not connect to the server/i)
      ).toBeInTheDocument();
    });
  });
});
