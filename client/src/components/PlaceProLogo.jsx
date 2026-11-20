import { GraduationCap } from 'lucide-react';

// PlacePro Logo Component
// Uses /logs.png for all app/landing/dashboard pages, keeping custom auth style for Login & Register
export default function PlaceProLogo({ size = 'md', dark = false, color = '#0062ff', variant = 'default' }) {
  const sizes = {
    sm: { box: 26, text: 15, icon: 15 },
    md: { box: 32, text: 18, icon: 18 },
    lg: { box: 40, text: 22, icon: 22 },
  };

  const s = sizes[size] || sizes.md;

  // Preserved for Login & Registration pages
  if (variant === 'auth' || variant === 'lamp') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
        <div
          style={{
            width: s.box,
            height: s.box,
            background: color,
            borderRadius: '7px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 6px rgba(0, 98, 255, 0.25)',
          }}
        >
          <span
            style={{
              color: '#fff',
              fontWeight: 900,
              fontSize: s.box * 0.52,
              lineHeight: 1,
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            P
          </span>
        </div>
        <span
          style={{
            fontWeight: 800,
            fontSize: s.text,
            color: dark ? '#fff' : '#0B1224',
            letterSpacing: '-0.3px',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          PlacePro
        </span>
      </div>
    );
  }

  // Official logo with /logs.png for all other pages (Landing, Dashboards, Docs, Legal)
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', userSelect: 'none' }}>
      <img
        src="/logs.png"
        alt="PlacePro"
        style={{
          width: s.box,
          height: s.box,
          objectFit: 'contain',
          borderRadius: '7px',
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontWeight: 800,
          fontSize: s.text,
          color: dark ? '#ffffff' : '#0B1224',
          letterSpacing: '-0.3px',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        PlacePro
      </span>
    </div>
  );
}
