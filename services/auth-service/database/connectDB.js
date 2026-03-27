const prisma = require('../config/prisma');

async function connectDB() {
  try {
    await prisma.$connect();
    console.log('Postgres connected');
  } catch (err) {
    console.error('Postgres connection failed:', err);
    process.exit(1);
  }
}

module.exports = { connectDB };
