const { getChannel } = require('../database/connectRabbitMQ');

const EXCHANGE = 'lexsync.events';

async function publishEvent(routingKey, payload) {
  try {
    const channel = getChannel();
    channel.assertExchange(EXCHANGE, 'topic', { durable: true });
    channel.publish(
      EXCHANGE,
      routingKey,
      Buffer.from(JSON.stringify(payload)),
      { persistent: true }
    );
  } catch (err) {
    console.error(`Failed to publish event [${routingKey}]:`, err.message);
  }
}

module.exports = { publishEvent };
