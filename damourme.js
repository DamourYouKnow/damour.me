/*
Server for damour.me

author: DamourYouKnow
*/

const SERVER_PORT = 3000;
const ROOT = "./public/";

var exports = module.exports = {};

var path = require("path");
var express = require("express");
var url = require("url");
var app = express();
exports.app = app;
var server = require("http").createServer(app);
exports.server = server;
var io = require("socket.io")(server);
exports.io = io;
var contentServer = require("./contentServer.js");
var cardsServer = require("./cardsServer.js");

server.listen(SERVER_PORT);

/*
Handle next request
*/
app.use(function(request, response, next) {
	logMessage(request.method + " request for " + request.url);
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

app.get("/kachow", function(request, response) {
	response.sendFile(
		path.join(__dirname, ROOT + "kachow.html")
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
	logMessage("Sending 404...");
	response.sendStatus(404);
});

function logMessage(message) {
	console.log(new Date() + ": " + message);
};
