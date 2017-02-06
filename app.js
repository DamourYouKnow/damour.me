/*
Server for damour.me

author: DamourYouKnow
*/

const SERVER_PORT = 3000;
const ROOT = "./public/";

var path = require("path");
var express = require("express");
var url = require("url");
var YouTube = require("youtube-node");
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
const YT = "https://www.youtube.com/watch?v=";
var contentQueue = [];
var currentContent = {};
var idQueue = [];
var currentStart = 0;

io.on("connection", function(socket) {
	var handleNextContent = function() {
		contentQueue.pop();
		idQueue.pop();
		playNextContent();
		updateQueue();
	};

	var playNextContent = function() {
		// do nothing if queue is empty
		if (contentQueue.length == 0) {
			// TODO maybe throw up a panel in place of the video?
			return;
		}

		logMessage("Playing next content...");

		// unqueue previous song
		currentContent = contentQueue[contentQueue.length - 1];
		currentTime = convertTime(currentContent.contentDetails.duration);
		currentStart = Date.now();

		var startTime = {};
		startTime.millis = 0;
		io.emit("nextContent", {id: currentContent.id, time: startTime});

		setTimeout(handleNextContent, currentTime.millis + 3000);
	};

	var updateQueue = function() {
		var queue = [];
		for (var i = contentQueue.length - 1; i >=0; i--) {
			var content = {};
			content.title = contentQueue[i].snippet.title;
			content.duration = convertTime(
				contentQueue[i].contentDetails.duration
			);
			queue.push(content);
		}

		io.emit("updateQueue", queue);
	};

	// TODO move somewhere else
	var convertTime = function(time) {
		var timeNew = {};
		var hStr = "";
		var mStr = "";
		var sStr = "";
		var c = time.length - 1;

		if (time.charAt(c) == 'S') {
			c--;
			while (!isNaN(time.charAt(c))) {
				sStr = time.charAt(c) + sStr;
				c--;
			}
		}
		if (time.charAt(c) == 'M') {
			c--;
			while (!isNaN(time.charAt(c))) {
				mStr = time.charAt(c) + mStr;
				c--;
			}
		}
		if (time.charAt(c) == 'H') {
			c--;
			while (!isNaN(time.charAt(c))) {
				hStr = time.charAt(c) + hStr;
				c--;
			}
		}

		h = parseInt(hStr);
		m = parseInt(mStr);
		s = parseInt(sStr);
		if (isNaN(h)) h = 0;
		if (isNaN(m)) m = 0;
		if (isNaN(s)) s = 0;
		timeNew.hours = h;
		timeNew.minutes = m;
		timeNew.seconds = s;
		timeNew.millis = (s * 1000) + (m * 60 * 1000) + (h * 60 * 60 * 1000);
		return timeNew;
	};

	logMessage("Connection received");
	updateQueue();

	// send current song
	if (contentQueue.length >= 1) {
		var startTime = {};
		startTime.millis = Date.now() - currentStart;
		socket.emit("nextContent", {id: currentContent.id, time: startTime});
	}

	/*
	Handler for client adding song to playlist
	*/
	socket.on("addSong", function(link) {
		console.log("Request to add " + link + " to queue");

		var urlObj = url.parse(link, true);

		if (!urlObj.query.hasOwnProperty("v")) {
			console.log("URL does not have query");
			socket.emit("message", "Error finding content.");
			return;
		}

		var id = urlObj.query.v;
		console.log("Content ID: " + id);

		var yt = new YouTube();
		var key = fileOperations.loadJSON("ytkey.json").key
		yt.setKey(key);
		yt.getById(id, function(error, result) {
			if (error || result.items.length == 0) {
				socket.emit("message", "Error finding content.");
				console.log(error);
			}
			if (idQueue.indexOf(result.items[0].id) >= 0) {
				socket.emit("message", "Already in queue.");
			}
			else if (!result.items[0].status.embeddable) {
				socket.emit("message", "Content not embeddable.");
			}
			else {
				logMessage(
					"Adding video " + result.items[0].snippet.title
				);

				console.log("length " + contentQueue.length);
				contentQueue.unshift(result.items[0]);
				idQueue.unshift(result.items[0].id);
				console.log("length " + contentQueue.length);
				updateQueue();

				// play right away if first in queue
				if (contentQueue.length == 1) {
					console.log("playing first in queue");
					playNextContent();
				}
			}
		});
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
