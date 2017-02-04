/*
Server for damour.me

author: DamourYouKnow
*/

const SERVER_PORT = 3000;
const ROOT = "./public/";

var path = require("path");
var express = require("express");
var app = express();

/*
Handle next request
*/
app.use(function(request, response, next) {
	console.log(request.method + " request for " + request.url);
	next();
});

/*
Serve index page
*/
app.get("/", function(request, response) {
	response.sendFile(path.join(__dirname, ROOT + "index.html"));
});

app.get("/regionalIndicatorConverter", function(request, response) {
	response.sendFile(
		path.join(__dirname, ROOT + "regionalIndicatorConverter.html")
	);
});

/*
Handle static requests
*/
app.use(express.static(ROOT));

/*
Handle bad requests
*/
app.all("*", function(request, response) {
	console.log("Sending 404...");
	response.sendStatus(404);
});

app.listen(SERVER_PORT, function() {
	console.log("Server listening on port " + SERVER_PORT);
});
