module("setup");
var mapDiv = document.createElement('div');
mapDiv.id = 'map-canvas';

var map = new google.maps.Map(mapDiv, {
	center: new google.maps.LatLng(41.790113, -87.600732),
	zoom: 18,
	mapTypeId: google.maps.MapTypeId.HYBRID
});

test("spatialsurvey loads", function() {
	notEqual(typeof spatialsurvey, 'undefined');
});

test("spatialsurvey.Button()", function() {
	spatialsurvey.init({ map: map });

	ok(true, spatialsurvey.hasOwnProperty('Button'));

	var button = new spatialsurvey.Button({ id: 'test-button' });
	ok(true, button.hasOwnProperty('show'));
});
test("spatialsurvey.PathData()", function() {
	spatialsurvey.init({ map: map });

	ok(true, spatialsurvey.hasOwnProperty('PathData'));
	var pathData = new spatialsurvey.PathData();

	sessionStorage.clear();
	localStorage.clear();
});

// sample polyline taken from March 2014 survey with database id 417
var samplePolylines = {
	1: new google.maps.Polyline({
		path: [
			new google.maps.LatLng(41.7858769102, -87.6007640362),
			new google.maps.LatLng(41.7858542832, -87.6011073589),
			new google.maps.LatLng(41.7933264168, -87.601236105),
			new google.maps.LatLng(41.7941295769, -87.601659894),
			new google.maps.LatLng(41.7932585436, -87.6011878252),
			new google.maps.LatLng(41.7851811262, -87.6010483503),
			new google.maps.LatLng(41.7851754694, -87.6005387306),
			new google.maps.LatLng(41.785186783, -87.6010859013),
			new google.maps.LatLng(41.7859561046, -87.6010859013),
			new google.maps.LatLng(41.7859504479, -87.6007908583),
			new google.maps.LatLng(41.7863464187, -87.6004904509),
			new google.maps.LatLng(41.7863577321, -87.5995570421),
			new google.maps.LatLng(41.7878680552, -87.599632144),
			new google.maps.LatLng(41.7878906815, -87.5985378027),
			new google.maps.LatLng(41.7884959318, -87.5984090567),
			new google.maps.LatLng(41.7882640141, -87.5989991426),
			new google.maps.LatLng(41.7882753272, -87.6006996632),
			new google.maps.LatLng(41.7876870445, -87.6006782055),
			new google.maps.LatLng(41.7873646181, -87.601069808),
			new google.maps.LatLng(41.7863520754, -87.6010537148),
			new google.maps.LatLng(41.7859957018, -87.6008284092),
			new google.maps.LatLng(41.7863690455, -87.6010805368),
			new google.maps.LatLng(41.7873476482, -87.6010912657),
			new google.maps.LatLng(41.7877549236, -87.6006889343),
			new google.maps.LatLng(41.78909552, -87.6007479429),
			new google.maps.LatLng(41.7876644182, -87.6006782055),
			new google.maps.LatLng(41.7872627989, -87.6010966301),
			new google.maps.LatLng(41.785124558, -87.6010805368),
			new google.maps.LatLng(41.7851811262, -87.6005172729),
			new google.maps.LatLng(41.7851302149, -87.6011180878),
			new google.maps.LatLng(41.7859674181, -87.6010483503),
			new google.maps.LatLng(41.7859617614, -87.6007694006),
			new google.maps.LatLng(41.7863803589, -87.6005119085),
			new google.maps.LatLng(41.7863690455, -87.5995838642),
			new google.maps.LatLng(41.7879246209, -87.5996482372),
			new google.maps.LatLng(41.7878284591, -87.6006728411),
			new google.maps.LatLng(41.7872797688, -87.6011019945),
			new google.maps.LatLng(41.7859561046, -87.6010751724),
			new google.maps.LatLng(41.7859617614, -87.6007640362),
			new google.maps.LatLng(41.7860296422, -87.6007586718)
		]
	})
};
