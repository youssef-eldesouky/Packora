import { emailToDisplayName } from '../AuthContext';

// ── emailToDisplayName ───────────────────────────────────────────────
describe('emailToDisplayName', () => {
  test('converts dot-separated email prefix to title case name', () => {
    expect(emailToDisplayName('john.doe@mail.com')).toBe('John Doe');
  });

  test('converts underscore-separated email prefix', () => {
    expect(emailToDisplayName('jane_smith@example.com')).toBe('Jane Smith');
  });

  test('converts hyphen-separated email prefix', () => {
    expect(emailToDisplayName('ali-hassan@packora.com')).toBe('Ali Hassan');
  });

  test('handles single word email prefix', () => {
    expect(emailToDisplayName('admin@packora.com')).toBe('Admin');
  });

  test('returns "User" for empty string', () => {
    expect(emailToDisplayName('')).toBe('User');
  });

  test('returns "User" for null', () => {
    expect(emailToDisplayName(null)).toBe('User');
  });

  test('handles email with numbers in prefix', () => {
    const result = emailToDisplayName('user123@mail.com');
    expect(result).toBe('User123');
  });
});
