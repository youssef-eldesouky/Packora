import { Package } from 'lucide-react';
import './Logo.css';

/**
 * Unified Packora logo component with premium circular gradient background.
 * Props:
 *  - size (number): icon size in pixels (default 24)
 *  - className (string): additional CSS classes for the wrapper
 *  - color (string): CSS colour (defaults to currentColor)
 */
export default function Logo({ size = 24, className = '', color = 'currentColor' }) {
  // Wrapper div provides gradient background and circular shape.
  const wrapperStyle = {
    width: size,
    height: size,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  return (
    <div className={`logo-icon ${className}`} style={wrapperStyle}>
      <Package size={size} color={color} />
    </div>
  );
}
