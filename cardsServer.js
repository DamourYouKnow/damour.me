var exports = module.exports = {};
var fileOperations = require("./fileOperations.js");
var path = require("path");
var fs = require("fs");
var main = require("./damourme.js");
var server = main.server;
var app = main.app;
var io = main.io.of("/cards");

const ROOT = "./public/";

const IDLE_KICK_COUNT = 2;
const ROUND_TIME = 60 * 1000;

// all card packs to be loaded in when app starts
var cardPacks = loadCardPacks();

// rooms for card games
var rooms = {};

// all users connected to the service
var allUsers = {};

/*
Get request handler for /cards

request: Object - request object
response: Object - response object
*/
app.get("/cards", function(request, response) {
	response.sendFile(path.join(__dirname, ROOT + "cards.html"));
});

/*
Handler for a client connecting

socket: Object - socket of connecting client
*/
io.on("connection", function(socket) {

	/*
	Handler for client disconnecting from chat

	data: Object - data sent out on disconnect
	*/
	socket.on("disconnect", function(data) {
		logMessage("Cards client disconnected");
	});
});

/*
Start the next round in the room

room: Object - room where new round is being started
*/
function nextRound(room) {
	room.pickPhase = true;
	room.czarPhase = false;
	room.roundTimer = setTimeout(checkIdle, ROUND_TIME);
}

/*
Checks for idle users in a room and takes action if required

room: Object - room being checked
*/
function checkIdle(room) {

}

/*
Registers a new user

socket: Object - socket of user
*/
function registerUser(socket) {
	logMessage("Registering new user " + socket.id);
	var newUser = {
		"socket": socket,
		"ip": socket.request.connection.remoteAddress,
		"room": null,
		"cards": [],
		"idleCount": 0,
		"playedCards": []
	};

	allUsers[socket.request.connection.remoteAddress] = newUser
	socket.user = newUser
}

/*
Creates a new room
*/
function newRoom() {
	var id = createId(5);
	while (id in rooms) {
		id = createId();
	}

	var room = {
		"userCount": 0,
		"users": {},
		"questions": [],
		"responses": [],
		"pickPhase": false,
		"czarPhase": false,
		"roundTimer": null
	};

	rooms[id]
}

/*
Creates a new deck of a specified packName

packName: String - name of specified packName

return: Object - card deck from pack
*/
// TODO function prototype with list input that merges multiple packs
function newCardDeck(packName) {
	if (packName in cardPacks) {
		var deck = copyCardPack(cardPacks[packName]);
		shuffle(deck.questions);
		shuffle(deck.responses);
		return deck;
	}

	console.log("Invalid card pack");
	return null;
}

/*
Loads all card packs into an object

return: Object - card packs object
*/
function loadCardPacks() {
	var cardPacks = {};

	var packNames = fileOperations.getFoldersInDirectory("./card_packs/");

	for (var p = 0; p < packNames.length; p++) {
		cardPacks[packNames[p]] = loadCardPack(
			"./card_packs/" + packNames[p] + "/"
		);
	}

	return cardPacks;
}

/*
Creates a unique copy of a card packNames

cardPack: Object - card pack to be copied

return: Object - copy of original card pack
*/
function copyCardPack(cardPack) {
	return {
		"questions": copyList(cardPack.questions),
		"responses": copyList(cardPack.responses)
	};
}

/*
Loads a card pack into an object

path: String - path to card pack

return: Object - card pack object
*/
function loadCardPack(path) {
	var cardPack = {};
	cardPack.questions = fileOperations.loadJSON(path + "questions.json");
	cardPack.responses = fileOperations.loadJSON(path + "responses.json");
	return cardPack;
}

/*
Shuffles a list

list: List - list to be shuffled
*/
function shuffle(list) {
	for (var i = 0; i < list.length; i++) {
		var rand = randomInteger(i, list.length - 1);
		var temp = list[i];
		list[i] = list[rand];
		list[rand] = temp;
	}
}

/*
Creates a copy of a list

list: List - list to copy

return: List - copy of original list
*/
function copyList(list) {
	var newList = [];
	for (var i = 0; i < list.length; i++) {
		newList.push(list[i]);
	}
	return newList;
}

/*
Creates a random id

len: Number - length of random id to be generated

return: String - random id
*/
function createId(len) {
	var text = "";
	var possible = "0123456789abcdefABCDEF";

	for( var i=0; i < len; i++ )
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}

/*
Generates a random number within a given range

min: Number - min integer in range
max: Number - max interger in range

return: Number - random integer
*/
function randomInteger(min, max) {
	var rand = Math.round(Math.random() * (max - min) + min);
	return rand;
}

/*
Logs a message to the console at the current time

message: String - message to log
*/
function logMessage(message) {
	console.log(new Date() + ": " + message);
}
