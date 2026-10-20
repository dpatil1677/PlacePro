// PlacePro Logo Component - Blue Theme
export default function PlaceProLogo({ size = 'md', dark = false, color = '#0062ff' }) {
  const sizes = {
    sm: { box: 24, text: 15 },
    md: { box: 30, text: 18 },
    lg: { box: 38, text: 22 },
  };

  const s = sizes[size] || sizes.md;

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
