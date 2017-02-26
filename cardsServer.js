var exports = module.exports = {};
var fileOperations = require("./fileOperations.js");
var path = require("path");
var fs = require("fs");
/*
var main = require("./damourme.js");
var server = main.server;
var app = main.app;
var io = require("socket.io")(server);
*/

const ROOT = "./public/";

var cardPacks = loadCardPacks();

var testPack = loadCardPacks()["test"];
shuffle(testPack.questions);
shuffle(testPack.responses);
console.log(testPack);

function loadCardPacks() {
	var cardPacks = {};

	var packNames = fileOperations.getFoldersInDirectory("./card_packs/");
	console.log(packNames);

	for (var p = 0; p < packNames.length; p++) {
		cardPacks[packNames[p]] = loadCardPack(
			"./card_packs/" + packNames[p] + "/"
		);
	}

	return cardPacks;
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
