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
const MAX_TIME = 10 * 60 * 60 * 1000;
const YT = "https://www.youtube.com/watch?v=";

var key = fileOperations.loadJSON("ytkey.json").key

var rooms = {};
var allUsers = {};

app.get("/player", function(request, response) {
	response.sendFile(path.join(__dirname, ROOT + "contentPlayer.html"));
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

		// get next song in queue
		room.currentContent = room.contentQueue[room.contentQueue.length - 1];
		room.currentDuration = convertTime(
			room.currentContent.contentDetails.duration
		);
		room.currentStart = Date.now();

		var startTime = {};
		startTime.millis = 0;

		// send next song to each user in room
		for (var userKey in room.users) {
			room.users[userKey].socket.emit(
				"nextContent",
				{"id": room.currentContent.id, "time": startTime}
			);
		}

		setTimeout(handleNextContent, room.currentDuration.millis + 3000, room);
	};

	var updateQueue = function(room) {
		var queue = [];

		for (var i =  room.contentQueue.length - 1; i >= 0; i--) {
			var next = {"title": room.contentQueue[i].snippet.title};
			queue.push(next);
		}

		for (var userKey in room.users) {
			room.users[userKey].socket.emit("updateQueue", queue);
		}
	};

	socket.on("skip", function() {
		var room = socket.user.room;

		// room owner can bypass skip vote
		if (room.creator == socket.user) {
			handleNextContent(room);
		}
		else {
			room.skipVotes++;
			// TODO detmermine vote conditions for skip
		}
	});

	socket.on("joinRoom", function(roomId) {
		if (roomId in rooms) {
			logMessage("User " + socket.id + " joined room " + roomId);
			var room = rooms[roomId];
			room.users[socket.id] = socket.user;
			socket.user.room = room;

			// send current content for room
			if (room.contentQueue.length >= 1) {
				var content = {
					"id": room.currentContent.id,
					"time": {"millis": Date.now() - room.currentStart}
				};
				socket.emit("nextContent", content);
			}

			updateQueue(room);
			socket.emit("joinRoomSuccess");
		}
		else {
			socket.emit("joinRoomFailed");
		}
	});

	socket.on("createRoom", function() {
		var id = createId(ROOM_ID_LENGTH);
		logMessage("Creating room " + id);
		var newRoom = {
			"contentQueue": [],
			"idQueue": [],
			"currentContent": {},
			"currentStart": 0,
			"users": {},
			"userCount": 1,
			"skipVotes": 0,
			"creator": {}
		};
		rooms[id] = newRoom;
		newRoom.users[socket.id] = socket.user;
		newRoom.creator = socket.user;
		socket.user.room = newRoom;
		socket.emit("newRoom", id);
	});

	/*
	Handler for client adding song to playlist
	*/
	socket.on("addSong", function(link) {
		var room = socket.user.room;
		if (room == undefined) {
			socket.emit("message", "Server error.");
			return;
		}

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
				socket.emit("message", "Content longer than 10 minutes.");
			}
			// check if livestream
			else if (vid.snippet.liveBroadcastContent != "none") {
				socket.emit("message", "Content is a livestream.");
			}
			// check if video not embeddable
			else if (!vid.status.embeddable) {
				socket.emit("message", "Content not embeddable.");
			}
			else {
				logMessage("Adding video " + vid.snippet.title);
				room.contentQueue.unshift(vid);
				room.idQueue.unshift(vid.id);
				updateQueue(room);

				// play right away if first in queue
				if (room.contentQueue.length == 1) {
					playNextContent(room);
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
	var newUser = {
		"socket": socket,
		"ip": socket.request.connection.remoteAddress,
		"room": null
	};

	allUsers[socket.id] = newUser;
	socket.user = newUser;
}

function createId(len) {
	var text = "";
	var possible = "0123456789abcdefABCDEF";

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
