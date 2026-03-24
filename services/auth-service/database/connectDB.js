const { PrismaClient } = require("@prisma/client");

let prisma;

async function connectDB() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: ["error", "warn"],
    });
  }

  try {
    await prisma.$connect();
    console.log("Postgres Database connected successfully");
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }

  return prisma;
}

module.exports = { connectDB };