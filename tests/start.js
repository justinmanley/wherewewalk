module("start");
test("PathData.send() and PathData.load()", function() {
	sessionStorage.clear();

	var pathData = new spatialsurvey.PathData();
	var polyline = samplePolylines[1];
	pathData.setPolylineCoordinates(polyline.getPath().getArray());
	pathData.setHasResponse(true);
	pathData.send({
		validates: function() { return true; },
		validationError: function() { }
	});

	equal(
		sessionStorage.getItem('path-data'), 
		pathData.toString(),
		"The value stored in the session should be the result of PathData.toString()."
	);

	var addTimePathData = new spatialsurvey.PathData();
	addTimePathData.load();
	addTimePathData.setHasResponse(true);

	equal(addTimePathData.toString(), pathData.toString());	
});
