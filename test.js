var arr = {};
arr["1"] = 2;
arr["2"] = 4;
arr["3"] = 6;

for (num in arr) {
	var iNum = arr[num];
	console.log(iNum);
}

console.log("done test");
