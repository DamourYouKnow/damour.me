var exports = module.exports = {};
var fileOperations = require("./fileOperations.js");
var path = require("path");
var url = require("url");
var YouTube = require("youtube-node");
var main = require("./app.js");
var server = main.server;
var app = main.app;
var io = require("socket.io")(server);

const ROOT = "./public/";
const ROOM_ID_LENGTH = 5;
const MAX_TIME = 10 * 60 * 1000;
const YT = "https://www.youtube.com/watch?v=";

var key = fileOperations.loadJSON("ytkey.json").key

var rooms = {};
var allUsers = {};

app.get("/player*", function(request, response) {
	response.sendFile(path.join(__dirname, ROOT + "contentPlayer.html"));

	// check for id
	var urlObj = url.parse(request.url, true);
	var id = urlObj.path.substring("/player/".length, urlObj.path.length);

	if (id in rooms) {

	}

	// create new room if no id
	else {
		logMessage("Creating new room " + id);
		var newRoom = {
			"id": createId(ROOM_ID_LENGTH),
			"contentQueue": [],
			"idQueue": [],
			"currentContent": {},
			"currentStart": 0,
			"users": {},
			"userCount": 1,
			"skipVotes": 0,
			"creator": ""
		};
		rooms[id] = newRoom;
	}
});

io.on("connection", function(socket) {
	// create new user object for socket
	registerUser(socket);

	var handleNextContent = function(room) {
		room.contentQueue.pop();
		room.idQueue.pop();
		playNextContent(room);
		updateQueue(room);
	};

	var playNextContent = function(room) {
		// do nothing if queue is empty
		if (room.contentQueue.length == 0) {
			return;
		}

		logMessage("Playing next content...");
		room.currentContent = room.contentQueue[contentQueue.length - 1];
		room.currentDuration = convertTime(
			currentContent.contentDetails.duration
		);
		room.currentStart = Date.now();

		var startTime = {};
		startTime.millis = 0;
		io.emit(
			"nextContent",
			{"id": room.currentContent.id, "time": startTime}
		);

		setTimeout(handleNextContent, currentDuration.millis + 3000, room);
	};

	var updateQueue = function(room) {
		for each (user in room) {
			console.log(user);
			user.socket.emit("updateQueue", room.idQueue);
		}
	};

	updateQueue();

	// send current song
	if (contentQueue.length >= 1) {
		var startTime = {};
		startTime.millis = Date.now() - currentStart;
		socket.emit("nextContent", {id: currentContent.id, time: startTime});
	}

	socket.on("skip", function() {

	});

	/*
	Handler for client adding song to playlist
	*/
	socket.on("addSong", function(link) {
		var room = socket.user.room;

		// get song id from link
		// TODO handle youtube.be/VIDEO_ID links
		var urlObj = url.parse(link, true);
		if (!urlObj.query.hasOwnProperty("v")) {
			socket.emit("message", "Error finding content.");
			return;
		}
		var id = urlObj.query.v;

		var yt = new YouTube();
		yt.setKey(key);
		yt.getById(id, function(error, result) {
			var vid = result.items[0];

			// check if song not found
			if (error || vid.length == 0) {
				socket.emit("message", "Error finding content.");
				logMessage(error);
			}
			// check for dupe
			else if (room.idQueue.indexOf(vid.id) >= 0) {
				socket.emit("message", "Already in queue.");
			}
			// check if over max time
			else if (convertTime(vid.contentDetails.duration).millis>MAX_TIME) {
				socket.emit("message", "Content longer than 10 minutes");
			}
			// check if video not embeddable
			else if (!vid.status.embeddable) {
				socket.emit("message", "Content not embeddable.");
			}
			else {
				logMessage("Adding video " + vid.snippet.title);

				room.contentQueue.unshift(vid);
				room.idQueue.unshift(vid);
				updateQueue();

				// play right away if first in queue
				if (contentQueue.length == 1) {
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

function registerUser(socket) {
	logMessage("Registering new user " + socket.id);
	var newUser = {"socket": socket, "room": null};
	allUsers[socket.id] = newUser;
	socket.user = newUser;
}

function createId(len) {
	var text = "";
	var possible = "abcdefghijklmnopqrstuvwxyz";

	for( var i=0; i < len; i++ )
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}

/*
Creates a time object from YouTube's duration string
*/
function convertTime(time) {
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

function logMessage(message) {
	console.log(new Date() + ": " + message);
}
