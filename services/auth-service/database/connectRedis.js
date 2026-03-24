const redis = require('redis');

async function connectRedis() {
    const client = redis.createClient({
        socket: {
            reconnectStrategy: (retries) => {
                console.log(`Retrying Redis... (${retries})`);
                return Math.min(retries * 100, 3000);
            }
        }
    });

    client.on('error', (err) => {
        console.error('Redis Error:', err.message);
    });

    client.on('connect', () => {
        console.log('Redis TCP connected');
    });

    client.on('ready', () => {
        console.log('Redis fully ready');
    });

    client.on('reconnecting', () => {
        console.log('Redis reconnecting...');
    });

    await client.connect();

    return client;
}

module.exports = { connectRedis };