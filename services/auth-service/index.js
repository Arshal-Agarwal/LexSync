require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { connectDB } = require('./database/connectDB');
const { connectRedis } = require('./database/connectRedis');
const { connectRabbitMQ } = require('./database/connectRabbitMQ');
const { generalLimiter } = require('./middlewares/rateLimiter');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers
app.use(helmet());

// CORS — restrict to known origins
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));

app.use(express.json({ limit: '10kb' })); // Reject oversized payloads
app.use(cookieParser());
app.use(generalLimiter);

// Routes
app.use('/auth', authRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'auth-service' }));

app.get('/',(req,res)=>{res.send("Welcome to auth service")});

// Startup
async function start() {
  await connectDB();
  await connectRedis();
  await connectRabbitMQ();

  app.listen(PORT, () => console.log(`Auth service running on port ${PORT}`));
}

start();
