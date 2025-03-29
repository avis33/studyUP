const express = require("express")
const bodyParser = require("body-parser")

const app = express()

// MIddleware
app.use(bodyParser.json())


const PORT = 3000
app.listen(PORT, ()=>console.log(`Server running at port ${PORT}`))