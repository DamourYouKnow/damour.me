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
console.log(cardPacks["test"]);

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
