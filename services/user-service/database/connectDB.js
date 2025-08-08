// database/connectDB.js

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();  // Load environment variables from .env

// MySQL connection pool
const mysqlPool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    port : process.env.MYSQL_PORT || 3307 ,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'password',
    database: process.env.MYSQL_DATABASE || 'your_mysql_database',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

console.log('✅ MySQL pool created');

async function testConnection() {
    try {
        const connection = await mysqlPool.getConnection();
        console.log('✅ Database connection successful');
        connection.release(); // Return the connection to the pool
    } catch (error) {
        console.error('❌ Database connection failed:', error);
    }
}

testConnection();

module.exports = {
    mysqlPool,
};
