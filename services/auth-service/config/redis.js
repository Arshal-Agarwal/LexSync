const redis = require('redis');

let client;

async function getRedis() {
  if (client) return client;

  client = redis.createClient({
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
    },
  });

  client.on('error', (err) => console.error('Redis Error:', err.message));
  client.on('ready', () => console.log('Redis ready'));

  await client.connect();
  return client;
}

module.exports = { getRedis };
