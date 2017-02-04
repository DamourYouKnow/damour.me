const SERVER_PORT = 3000;

var path = require('path');
var express = require('express');
var app = express();

var staticPath = path.join(__dirname, '/public');
app.use(express.static(staticPath));

app.listen(SERVER_PORT, function() {
	console.log("Server listening on port " + SERVER_PORT);
});
