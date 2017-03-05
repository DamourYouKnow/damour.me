/*
Client side code for cards game

author: DamourYouKnow
*/

var socket = io("/cards");

$(document).ready(function() {
	var url = window.location.href;
	var idFromUrl = "";
	var c = url.length - 1;
	while (url.charAt(c) != "=" && url.charAt(c) != '/') {
		idFromUrl = url.charAt(c) + idFromUrl;
		c--;
	}

	socket.emit("joinRoom", idFromUrl);

	socket.on("joinRoomFailed", function() {
		console.log("Join failed");
		socket.emit("createRoom");
	});

	socket.on("joinRoomSuccess", function() {
		console.log("Join successfull");
		$("#roomTitle").html(
			"<p>Share this room: " + window.location.href
				+ "</p>"
		);
	});

	socket.on("newRoom", function(id) {
		var urlStr = window.location.protocol.toString()
			+ "//"
			+ window.location.host + "/player?room=" + id;
		console.log(urlStr);
		window.location.href = urlStr;
	});

});
