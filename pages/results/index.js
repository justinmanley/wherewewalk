function initialize() {
	var map = new google.maps.Map(document.getElementById("map-canvas"), {
		center: new google.maps.LatLng(41.790113, -87.600732),
		zoom: 18,
		mapTypeId: null
	});
	map.data.loadGeoJson('../../campusbuildings.geojson');
	map.data.setStyle({
		visible: true
	});	

	map.data.loadGeoJson('../../sidewalks.geojson');
	map.data.setStyle(function(feature) {
		return {
			strokeWeight: feature.getProperty("Route_W14"),
			strokeLinecap: 'square',
			strokeColor: '#ffffff',
			visible: true
		};	
	});
}
google.maps.event.addDomListener(window, 'load', initialize);