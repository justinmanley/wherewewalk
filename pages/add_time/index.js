if(!Array.prototype.last) {
    Array.prototype.last = function() {
        return this[this.length - 1];
    }
}

function initialize() {
	var map = new google.maps.Map(document.getElementById("map-canvas"), {
		center: new google.maps.LatLng(41.790113, -87.600732),
		zoom: 18,
		mapTypeId: google.maps.MapTypeId.HYBRID
	});
	var drawingManager = new google.maps.drawing.DrawingManager({
		drawingControl: false
	});	

	// all user data is stored in this object
	var surveyHelper = spatialsurvey(map, document);
	var mapHelper = mapcalc(map, document);
	
	var data = new surveyHelper.PathData();
	data.load(function() {}, onLoadPathData);

	function onLoadPathData() {
		var polyline = data.getPolyline();
		polyline.setMap(map);

		surveyHelper.timestamp({
			polyline: polyline,
			position: polyline.getPath().getAt(0),
			startTime: data.getStartTime(),
			type: 'single',
			openOnCreate: false
		}).create();

		surveyHelper.timestamp({
			polyline: polyline,
			position: polyline.getPath().getArray().last(),
			startTime: data.getEndTime(),
			type: 'single',
			openOnCreate: false
		}).create();					

		setTimeout(function() { map.panTo(data.getPolyline().getPath().getAt(0)) }, 1000);

		surveyHelper.showProgress(3,4, 'Add times.');

		instructionsPrimary = [
			{ 
				content: '<h2>What time?</h2>'+
						'<h3>When did you visit the different spots along your path?  How long did you spend there?</h3>'+
						'<p>Where did you spend more than half an hour yesterday?  You can mark those spots on the map by clicking along your path and entering in the pop-up bubble the time you arrived and the time you left.</p>'+
						'<p>This will help us better understand the ebb and flow of foot traffic around campus.</p>',
				buttonText: 'GO'
			}		
		]

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
							'</div><!-- .sidebar-button -->'
		var sidebar = surveyHelper.sidebar.create({
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

		surveyHelper.instructions.create(drawingManager, { 
			content: instructionsPrimary,
			action: function() {
				new surveyHelper.Button({
					id: 'next-button',
					text:'NEXT',
					onClick: function() {
						data.setHasResponse(true);
						data.send({
							destinationPageName: 'end',
							currentPageName: 'add_time',
							validates: function() { return true; },
							validationError: function() { }
						});
					}
				}).show();
				sidebar.show();
				sidebar.toggleHelp();
			},
			hideAction: function() { sidebar.hide(); }
		});		

		google.maps.event.addListener(map, 'click', function(event) {			
			var userPolyline = data.getPolyline();
			var tolerance = 0.05*Math.pow(1.1, -map.getZoom());
			if (google.maps.geometry.poly.isLocationOnEdge(event.latLng, userPolyline, tolerance)) {
				var position = mapHelper.closestPointOnPolyline(userPolyline, event.latLng);
				surveyHelper.timestamp({
					polyline: userPolyline, 
					position: position,
					type: 'double'
				}).create();
			}			
		});		
	}

}

google.maps.event.addDomListener(window, 'load', initialize);
