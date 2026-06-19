import { Package } from 'lucide-react';
import './Logo.css';


export default function Logo({ size = 24, className = '', color = 'currentColor' }) {
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
