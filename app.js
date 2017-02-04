/*
Server for damour.me

author: DamourYouKnow
*/

const SERVER_PORT = 3000;
const ROOT = "./public/";

var path = require("path");
var express = require("express");
var url = require("url");
var youtube = require("youtube-node");
var fileOperations = require("./fileOperations.js");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);

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

app.get("/player", function(request, response) {
	response.sendFile(path.join(__dirname, ROOT + "contentPlayer.html"));
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
	logMessage("Sending 404...");
	response.sendStatus(404);
});

/*
Socket code for music player TODO move somewhere else
*/
const YT = "https://www.youtube.com/watch?v="
var contentPlayers = fileOperations.loadJSON("contentPlayers.json");
var contentQueue = [];
var currentContent = "";
var currentDuration = 0;

var handleNextContent = function() {

}

io.on("connection", function(socket) {
	logMessage("Connection received");

	/*
	Handler for client adding song to playlist
	*/
	socket.on("addSong", function(data) {
		var urlObj = url.parse(link, true);
		var id = urlObj.query.v;

		youTube.getById('HcwTxRuq-uk', function(error, result) {
			if (error) {
				socket.emit("message", {message: "Error finding content."});
			}
			else {
				contentQueue.unshift(id);
				// play right away if first in queue
				if (contentQueue.length == 1) {
					io.emit("nextSong", {contentId: id});
					currentContent = contentQueue.pop();
					//currentDuration =
				}
				if (contentQueue.length >= 1) {
					//setTimeout(handleNextContent,
				}
			}
		});
	});

	/*
	Handler for client removing song from playlist
	*/
	socket.on("removeSong", function(data) {

	});

	/*
	Handler or client disconnecting from chat
	*/
	socket.on("disconnect", function(data) {
		logMessage("Client disconnected");
	});

});

function logMessage(message) {
	console.log(new Date() + ": " + message);
};
