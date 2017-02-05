/*
Client side code for content sharer

author: DamourYouKnow
*/

var socket = io();

$(document).ready(function() {
	socket.on("message", function(message) {
		console.log("Message received");
		$("#log").html("<p class='warning'>" + message + "</p>");
		setTimeout(function() {
			$("#log").empty();
		}, 2500);

	});

	socket.on("nextSong", function() {
		console.log("Playing next content");

	});

	socket.on("updateQueue", function(queue) {
		console.log("Updating queue");
		console.log(queue);
		$("#contentQueue").html("<p>Current queue:<\p>");
		for (var i = 0; i < queue.length; i++) {
			$("#contentQueue").append("<p>" + queue[i].title + "<\p>");
		}
	});

	// add song to queue if enter is pressed

	// add song to queue if add button is pressed
	$("#queueButton").click(function() {
		socket.emit("addSong", $("#inputArea").val());
	});

	$("#inputArea").keydown(function(event) {
		console.log("keypress");
		if (event.keyCode === 13) {
			socket.emit("addSong", $(this).val());
		}
	});
});
