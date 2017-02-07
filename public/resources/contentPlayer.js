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

	socket.on("nextContent", function(data) {
		console.log(data.id);
		console.log("Playing next content");

		var linkStr = "https://www.youtube.com/embed/" + data.id +
			"?autoplay=1";

		var seconds = Math.round(data.time.millis / 1000);
		linkStr = linkStr + "&start=" + seconds;

		console.log(linkStr);

		$("#contentPlayer").attr({"src": linkStr});
	});

	socket.on("updateQueue", function(queue) {
		console.log("Updating queue");
		$("#contentQueue").html("<p>Current queue:<\p>");
		for (var i = 0; i < queue.length; i++) {
			$("#contentQueue").append("<p>" + queue[i].title + "<\p>");
		}
	});

	// add song to queue if enter is pressed

	// add song to queue if add button is pressed
	$("#queueButton").click(function() {
		socket.emit("addSong", $("#inputArea").val());
		$("#inputArea").val("");
	});

	$("#inputArea").keydown(function(event) {
		if (event.keyCode === 13) {
			socket.emit("addSong", $(this).val());
			$("#inputArea").val("");
		}
	});
});
