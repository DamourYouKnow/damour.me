var exports = module.exports = {};
var fileOperations = require("./fileOperations.js");
var path = require("path");
var fs = require("fs");
var main = require("./damourme.js");
var server = main.server;
var app = main.app;
var io = main.io.of("/cards");



const ROOT = "./public/";

var cardPacks = loadCardPacks();
var rooms = {};

app.get("/cards", function(request, response) {
	response.sendFile(path.join(__dirname, ROOT + "cards.html"));
});

io.on("connection", function(socket) {

	/*
	Handler or client disconnecting from chat
	*/
	socket.on("disconnect", function(data) {
		logMessage("Cards client disconnected");
	});
});


function newRoom() {
	var id = createId(5);
	while (id in rooms) {
		id = createId();
	}

	var room = {
		userCount: 0,
		users: {},
		questions: [],
		responses: [],
		inProgress: false
	};

	rooms[id]
}

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

function copyCardPack(cardPack) {
	return {
		"questions": copyList(cardPack.questions),
		"responses": copyList(cardPack.responses)
	};
}

function loadCardPack(path) {
	var cardPack = {};
	cardPack.questions = fileOperations.loadJSON(path + "questions.json");
	cardPack.responses = fileOperations.loadJSON(path + "responses.json");
	return cardPack;
}

function shuffle(list) {
	for (var i = 0; i < list.length; i++) {
		var rand = randomInteger(i, list.length - 1);
		var temp = list[i];
		list[i] = list[rand];
		list[rand] = temp;
	}
}

function copyList(list) {
	var newList = [];
	for (var i = 0; i < list.length; i++) {
		newList.push(list[i]);
	}
	return newList;
}

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

function logMessage(message) {
	console.log(new Date() + ": " + message);
}
