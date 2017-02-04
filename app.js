const SERVER_PORT = 8080;
const SERVER_IP = "162.243.39.37";

var path = require('path');
var express = require('express');
var app = express();

var staticPath = path.join(__dirname, '/public');
app.use(express.static(staticPath));

app.listen(SERVER_PORT, function() {
	console.log("Server listening on port " + SERVER_PORT);
});
