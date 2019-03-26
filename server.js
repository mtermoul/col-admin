var express = require('express')
var serveStatic = require('serve-static')
require('dotenv').config()

// this used by Cosmic JS hosting to start the server instance.
var app = express()
app.use(serveStatic(__dirname + "/dist"))

var port = process.env.PORT || 5000
app.listen(port)

console.log('server started '+ port)
