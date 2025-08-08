require('./database/connectDB')

const express = require('express')
const app = express()
const cors = require("cors")
const PORT = 5000

app.use(express())
app.use(cors())

app.get('/', (req, res) => {
  res.send('User Service is running')
})

app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`)
})