const SOUND_FILES = [
	"Mario Jingle.mp3",
	"Kreygasm.wav"
]

var audios = {};

$(document).ready(function() {
	for (var s = 0; s < SOUND_FILES.length; s++) {
		audios[SOUND_FILES[s]] = new Audio("sounds/" + SOUND_FILES[s]);

		$("#buttonContainer").append(
			'<button class="roundButton" id="button' + s + '">'
			+ SOUND_FILES[s].split(".")[0] + '</button>'
		);

		$("#button" + s).click(function() {
			var id = $(this).attr("id").substring("button".length);
			console.log(id);
			audios[SOUND_FILES[parseInt(id)]].play();
		});
	}
});
