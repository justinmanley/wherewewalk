function initialize() {
	var map = new google.maps.Map(document.getElementById("map-canvas"), {
		center: new google.maps.LatLng(41.790113, -87.600732),
		zoom: 18,
		mapTypeId: google.maps.MapTypeId.HYBRID
	});
	var drawingManager = new google.maps.drawing.DrawingManager({
		drawingControl: false
	});	
	
	spatialsurvey.init({
		map: map, 
		drawingManager: drawingManager,
		appName: 'wherewewalk'
	});
	mapHelper.init({ 
		map: map,
		drawingManager: drawingManager
	});	

	var surveyResponse = new spatialsurvey.SurveyResponse();

	var polyline = surveyResponse.getValue('path');
	polyline.setMap(map);

	new spatialsurvey.Timestamp({
		polyline: polyline,
		position: polyline.getPath().getAt(0),
		startTime: surveyResponse.getValue('startTime'),
		type: 'single'
	}).show('open');

	new spatialsurvey.Timestamp({
		polyline: polyline,
		position: polyline.getPath().getArray()[polyline.getPath().getArray().length - 1],
		startTime: surveyResponse.getValue('endTime'),
		type: 'single'
	}).show('open');					

	setTimeout(function() { map.panTo(surveyResponse.getValue('path').getPath().getAt(0)); }, 1000);

	new spatialsurvey.ProgressBar({ currentScreen: 3, max: 5, description: 'Add times.' });

	instructionsPrimary = [
		{
			content: '<h2>What time?</h2>'+
					'<h3>When did you visit the different spots along your path?  How long did you spend there?</h3>'+
					'<p>Where did you spend more than half an hour yesterday?  You can mark those spots on the map by clicking along your path and entering in the pop-up bubble the time you arrived and the time you left.</p>'+
					'<p>This will help us better understand the ebb and flow of foot traffic around campus.</p>',
			buttonText: 'GO'
		}		
	];

	instructionsSidebar = '<div id="instructions-content">'+
							'<h2>Instructions</h2>'+
							'<p>Retrace the path that you drew on the map.'+
								'Whenever you come to a stopping point (a place where you spent half an hour or longer),'+
								' click on your path and record when you arrived and when you left.'+
							'</p>'+								
						'</div><!-- #instructions-sidebar -->';

	var helpContent = '<p>'+
							'You can go back to the previous screen to edit your path if you need to:'+
						'</p>'+								
						'<div class="sidebar-button">'+
							'<a href="../start/"><button id="edit-path" class="dowsing-button">EDIT PATH</button></a>'+
						'</div><!-- .sidebar-button -->'+
						'<p>You can also go back to the tutorial for a refresher.</p>'+
						'<div class="sidebar-button">'+
							'<a href="../tutorial/index.php"><button id="back-to-tutorial-button" class="dowsing-button dowsing-button-grey">BACK TO TUTORIAL</button></a>'+
						'</div><!-- .sidebar-button -->';
	var sidebar = new spatialsurvey.Sidebar({
		height: 100, 
		content: instructionsSidebar, 
		sidebarId: 'instructions-sidebar',
		help: {
			teaser: 'Stuck?  Need help?',
			teaserId: 'help-teaser',
			content: helpContent,
			contentId: 'help-content'
		}
	});
	sidebar.show();

	var instructions = new spatialsurvey.Instructions({ 
		content: instructionsPrimary,
		action: function() {
			new spatialsurvey.Button({
				id: 'next-button',
				text:'NEXT',
				onClick: function() {
					surveyResponse.setValue('timestamps', getTimestamps());
					spatialsurvey.advance({ destinationPageName: 'meals' });
				}
			}).show();
			sidebar.show();
			sidebar.toggleHelp();
		},
		hideAction: function() { sidebar.hide(); }
	}).show();

	google.maps.event.addListener(map, 'click', function(event) {			
		var userPolyline = surveyResponse.getValue('path');
		var tolerance = 0.05*Math.pow(1.1, -map.getZoom());
		if (google.maps.geometry.poly.isLocationOnEdge(event.latLng, userPolyline, tolerance)) {
			var position = mapHelper.closestPointOnPolyline(userPolyline, event.latLng);
			new spatialsurvey.Timestamp({
				polyline: userPolyline, 
				position: position,
				type: 'double'
			}).show('open');
		}			
	});

	function getTimestamps() {
		var timestampWindows = document.getElementsByClassName('timestamp-form');
		var timestamps = [];
		for(var i = 0; i < timestampWindows.length; i++) {
			var startTime = timestampWindows[i].querySelector('input[name=start-time]').value;
			var endTime = timestampWindows[i].querySelector('input[name=end-time]').value;
			var lat = timestampWindows[i].getElementsByClassName('timestamp-position-lat')[0].value;
			var lng = timestampWindows[i].getElementsByClassName('timestamp-position-lng')[0].value;

			timestamps.push({ 'startTime': startTime, 'endTime': endTime, 'position': { 'lat': lat, 'lng': lng }});
		}
		return timestamps;
	}		
}

google.maps.event.addDomListener(window, 'load', initialize);
