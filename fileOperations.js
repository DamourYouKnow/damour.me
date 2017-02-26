var fs = require("fs");
var path = require("path");

var exports = module.exports = {};

/*
loads JSON data from a file

filename: String - file we are loading JSON data from

return: Object - JSON object read from file or empty object if file not found
*/
exports.loadJSON = function(filename) {
	if (fs.existsSync(filename)) {
		return JSON.parse(fs.readFileSync(filename));
	}
	return {};
};

/*
Saves object to a file using JSON

filename: String - file we are saving JSON data to
object: Object - object to be saved in JSON
*/
exports.saveJSON = function(filename, object) {
	fs.writeFileSync(filename, JSON.stringify(object));
};

/*
Gets a list of all folder names in a direcotry

path: String - location of directory

return: Array - list of folder names in directory
*/
exports.getFoldersInDirectory = function(path) {
	var folders = [];

	folders = fs.readdirSync(path, (err, files) => {
		files.forEach(file => {
			folders.push(file);
			return folders
 		});
	});

	return folders;
};
