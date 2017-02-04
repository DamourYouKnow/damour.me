/*
Client side script for converting normal text into regional indicator symbols

author: DamourYouKnow
*/

const LETTERS_IN_ALPHABET = 26;
const A_REGIONAL_DECIMAL = 127462;
const A_DECIMAL = 'A'.charCodeAt(0);

$(document).ready(function() {
	console.log("Document loaded");
	$("#convertButton").click(convert);
});

function convert() {
	var inputText = $("#inputArea").val().toUpperCase();
	var outputText = "";
	var containsInvalidChar = false;

	for (var c = 0; c < inputText.length; c++) {
		// handle spaces
		if (inputText.charAt(c) == ' ') {
			outputText += "&nbsp&nbsp&nbsp&nbsp";
		}
		// handles new lines
		else if (inputText.charAt(c) == '\n') {
			outputText += "\n";
		}
		// convert valid characters
		else if (isValidCharacter(inputText.charAt(c))) {
			outputText += " &#" +
				(A_REGIONAL_DECIMAL + inputText.charCodeAt(c) - A_DECIMAL)
				.toString();
		}
		// handle invalid characters
		else {
			outputText += "<span class='warning'>" + " " + inputText.charAt(c)
				+ "</span>";

			containsInvalidChar = true;
		}
	}

	var outputLines = outputText.split('\n');
	$("#outputArea").empty();
	for (var l = 0; l < outputLines.length; l++) {
		$("#outputArea").append("<p>" + outputLines[l] + "</p>");
	}

	// add warning if invalid character exists
	if (containsInvalidChar) {
		$("#outputArea").append(
			"<br><span class='warning'>"
				+ "Some characters could not be converted."
				+ "</span>"
		);
	}
};

function isValidCharacter(char) {
	var decCode = char.toString().toUpperCase().charCodeAt(0);

	return decCode  >= A_DECIMAL
		&& decCode <= A_DECIMAL + LETTERS_IN_ALPHABET - 1;
};
