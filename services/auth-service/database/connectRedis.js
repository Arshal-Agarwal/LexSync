const { getRedis } = require('../config/redis');

async function connectRedis() {
  await getRedis();
}

module.exports = { connectRedis };
