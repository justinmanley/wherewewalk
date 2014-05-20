function initialize() {
	var mapCenter = new google.maps.LatLng(41.78961025632396, -87.59967505931854);
	var map = new google.maps.Map(document.getElementById("map-canvas"), {
		center: mapCenter,
		zoom: 19,
		maxZoom: 20,
		minZoom: 18,
		zoomControl: { style: 'SMALL' },
		mapTypeId: google.maps.MapTypeId.HYBRID
	});
	var drawingManager = new google.maps.drawing.DrawingManager({
		drawingMode: google.maps.drawing.OverlayType.POLYLINE,
		drawingControl: false,
		polylineOptions: {
			editable: true,
			strokeColor: '#4387fd',
			strokeWeight: 4
		}
	});	

	spatialsurvey.init({
		map: map, 
		drawingManager: drawingManager
	});
	mapHelper.init({ 
		map: map,
		drawingManager: drawingManager
	});

	var data = new spatialsurvey.PathData();
	data.load();
	var polyline = data.getPolyline();

	var meals = ['breakfast', 'coffee', 'dinner', 'lunch' ];
	var sidebarContent = '<h2>Instructions</h2>'+
						'<p>Drag the icons for breakfast, lunch, and dinner, onto the map.  The pins will automatically snap to your path.</p>'+
						'<table>';
	for (var i = 0; i < meals.length; i++) {
		sidebarContent += '<tr><td>' + meals[i] + '</td><td>';
		sidebarContent += '<img id="' + meals[i] + '" src="../../images/' + meals[i] + '-pin.png" title="' + meals[i] + '" draggable="true" width="40" class="meal-pin"/>';		
		sidebarContent += '</td>';
	}
	sidebarContent += '</table>';

	var sidebar = spatialsurvey.sidebar.create({
		content: sidebarContent,
		height: 395,
		sidebarId: 'instructions-sidebar'
	});

	var instructions = new spatialsurvey.Instructions({
		content: [{
			content: '<h2>Where did you eat on campus today?</h2>'+
					'<hr />'+
					'<p>We know that campus eateries are important gathering places.  Help us understand ___: tell us where you had breakfast, lunch, and dinner, where you stopped to grab a coffee, or where you had a snack.</p>',
			buttonText: 'OK'
		}],
		action: function() {
			polyline.setMap(map);			
			sidebar.show();
			function dragAndDropMeal(meal) {
				google.maps.event.addDomListener(document.getElementById(meal), 'dragstart', function() {
					var onDragover = google.maps.event.addDomListener(document.getElementById('map-canvas'), 'dragover', function(event) {
						event.preventDefault();
					});
					var onDrop = google.maps.event.addDomListener(document.getElementById('map-canvas'), 'drop', function(event) {
						var marker = new google.maps.Marker({
							position: mapHelper.closestPointOnPolyline(polyline, mapHelper.pixelsToLatLng(event.clientX, event.clientY)),
							icon: {
								url: "../../images/" + meal + "-pin.png",
								scaledSize: new google.maps.Size(40,60)
							},
							map: map,
							draggable: true
						});
						google.maps.event.addListener(marker, 'rightclick', function() {
							marker.setMap(null);
						});
						google.maps.event.addListener(marker, 'drag', function() {
							var dragPosition = mapHelper.closestPointOnPolyline(polyline, marker.getPosition());
							marker.setPosition(dragPosition);
						});
						google.maps.event.removeListener(onDragover);
						google.maps.event.removeListener(onDrop);
					});
				});				
			}

			for (var i = 0; i < meals.length; i++) {
				dragAndDropMeal(meals[i]);				
			}
		},
		hideAction: function() {}
	}).show();

}
google.maps.event.addDomListener(window, 'load', initialize);