const express = require('express')
const app = express()
require('dotenv').config();
const {connectDB} = require('./database/connectDB');
const {connectRedis} = require('./database/connectRedis');
const {connectRabbitMQ} = require('./database/connectRabbitMQ')
const port = process.env.PORT | 3001;

connectDB();
connectRedis();
connectRabbitMQ();

app.get('/', (req, res) => {
  res.send('Hello from auth service!')
})

app.listen(port, () => {
  console.log(`Auth service listening on port ${port}`)
})