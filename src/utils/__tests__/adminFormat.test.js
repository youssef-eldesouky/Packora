import { parseAmount, formatMoney, formatMoneyDecimal } from '../adminFormat';

describe('parseAmount', () => {
  test('returns number as-is when given a number', () => {
    expect(parseAmount(100)).toBe(100);
    expect(parseAmount(0)).toBe(0);
    expect(parseAmount(99.99)).toBe(99.99);
  });

  test('strips currency symbols and returns a number', () => {
    expect(parseAmount('EGP 100')).toBe(100);
    expect(parseAmount('$50.5')).toBe(50.5);
    expect(parseAmount('EGP 1,500')).toBe(1500);
  });

  test('returns 0 for null or undefined', () => {
    expect(parseAmount(null)).toBe(0);
    expect(parseAmount(undefined)).toBe(0);
    expect(parseAmount('')).toBe(0);
  });

  test('returns 0 for non-numeric strings', () => {
    expect(parseAmount('abc')).toBe(0);
  });
});

describe('formatMoney', () => {
  test('formats integer amounts in EGP without decimals', () => {
    const result = formatMoney(1000);
    expect(result).toContain('1,000');
    expect(result).toContain('EGP');
  });

  test('formats zero correctly', () => {
    const result = formatMoney(0);
    expect(result).toContain('0');
    expect(result).toContain('EGP');
  });
});

describe('formatMoneyDecimal', () => {
  test('formats amounts with 2 decimal places', () => {
    const result = formatMoneyDecimal(99.9);
    expect(result).toContain('99.90');
    expect(result).toContain('EGP');
  });

  test('formats zero with decimals', () => {
    const result = formatMoneyDecimal(0);
    expect(result).toContain('0.00');
  });
});
