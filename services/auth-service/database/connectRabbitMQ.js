const amqp = require("amqplib");
require('dotenv').config();

let channel;

async function connectRabbitMQ() {
  try {
    const rabbitMQ_username = process.env.rabbitMQ_username;
    const rabbitMQ_password = process.env.rabbitMQ_password;
    const connection = await amqp.connect(`amqp://${rabbitMQ_username}:${rabbitMQ_password}@localhost:5672`);
    channel = await connection.createChannel();
    console.log("Connected to RabbitMQ");
  } catch (err) {
    console.error("RabbitMQ connection failed:", err.message);
  }
}

function getChannel() {
  if (!channel) throw new Error("Channel not initialized");
  return channel;
}

module.exports = { connectRabbitMQ, getChannel };