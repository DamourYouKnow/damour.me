/*
Client side script for converting normal text into regional indicator symbols

author: DamourYouKnow
*/

const LETTERS_IN_ALPHABET = 26;
const A_REGIONAL_DECIMAL = 127462;
const A_DECIMAL = 65

$(document).ready(function() {
	console.log("Document loaded");
	$("#convertButton").click(convert);
});

function convert() {
	console.log("Convert button clicked");

	var inputText = $("#inputArea").val().toUpperCase();
	var outputText = "";

	for (var c = 0; c < inputText.length; c++) {
		var charDecimal = inputText.charCodeAt(c);

		if (inputText.charAt(c) == ' ') {
			outputText += "&nbsp&nbsp&nbsp&nbsp";
		}
		else if (inputText.charAt(c) == '\n') {
			console.log("newline");
			outputText += "\n";
		}
		else if (charDecimal < A_DECIMAL
			|| charDecimal > A_DECIMAL + LETTERS_IN_ALPHABET - 1) {

			outputText += "?";
		}
		else {
			outputText += " &#"
				+ (A_REGIONAL_DECIMAL + charDecimal - A_DECIMAL).toString();
		}
	}

	var outputLines = outputText.split('\n');
	$("#outputArea").empty();
	for (var l = 0; l < outputLines.length; l++) {
		$("#outputArea").append("<p>" + outputLines[l] + "</p>");
	}
}
