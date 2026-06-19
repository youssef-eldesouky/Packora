import { getStoredToken, API_BASE } from '../api';

// ── getStoredToken ───────────────────────────────────────────────────
describe('getStoredToken', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('returns null when localStorage is empty', () => {
    expect(getStoredToken()).toBeNull();
  });

  test('returns the token when valid auth data is stored', () => {
    localStorage.setItem(
      'packora_user_auth',
      JSON.stringify({ token: 'my-jwt-token', role: 'ROLE_USER' })
    );
    expect(getStoredToken()).toBe('my-jwt-token');
  });

  test('returns null when stored data has no token field', () => {
    localStorage.setItem('packora_user_auth', JSON.stringify({ role: 'ROLE_USER' }));
    expect(getStoredToken()).toBeNull();
  });

  test('returns null when stored data is malformed JSON', () => {
    localStorage.setItem('packora_user_auth', 'not-valid-json{{{');
    expect(getStoredToken()).toBeNull();
  });
});

// ── API_BASE ─────────────────────────────────────────────────────────
describe('API_BASE', () => {
  test('is a non-empty string', () => {
    expect(typeof API_BASE).toBe('string');
  });

  test('defaults to localhost when no env var set', () => {
    // In test environment REACT_APP_API_BASE is not set, so falls back
    expect(API_BASE).toBe('http://localhost:8080');
  });
});
