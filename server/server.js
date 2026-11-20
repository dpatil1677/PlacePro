
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
  process.env.FRONTEND_URL
].filter(Boolean);

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
