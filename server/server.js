
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import studentRoutes from './routes/studentRoutes.js';

const app = express();
const PORT = process.env.PORT || 5001;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://place-pro-smoky.vercel.app',
  'https://www.place-pro.site',
  process.env.FRONTEND_URL
].filter(Boolean);

// ── Security headers (replaces helmet) ───────────────────────────────────────
app.use((req, res, next) => {
  // Content Security Policy — fixes the -25 MDN Observatory penalty
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://placepro-1.onrender.com https://place-pro.site https://www.place-pro.site",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join('; ')
  );

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Stop browsers from MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Only send referrer on same-origin requests
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Force HTTPS for 1 year (production only)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Disable browser features that PlacePro doesn't use
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  next();
});
// ─────────────────────────────────────────────────────────────────────────────

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'PlacePro API',
    message: 'Backend is running successfully!'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`PlacePro API running on port ${PORT}`);
});
