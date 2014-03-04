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
	var surveyHelper = spatialsurvey(map, document, drawingManager);
	var mapHelper = mapcalc(map, document);

	var data = surveyHelper.pathData();
	data.load(onEmptyPath, onPathLoad);

	function onPathLoad() {
		var polyline = data.getPolyline();
		polyline.setOptions({ editable: true });
		polyline.setMap(map);

		drawingManager.setOptions({ drawingMode: null });
		mapHelper.rightClickButton(polyline);

		surveyHelper.instructions.create(drawingManager, { 
			content: instructionsPrimary,
			action: function() { 
				sidebar.show(); 
				sidebar.toggleHelp();

				document.getElementById('sidebar-start-time').value = data.getStartTime();
				document.getElementById('sidebar-end-time').value = data.getEndTime();

				surveyHelper.showNextButton(data, 'add_time', 'start', function() {	
					var startTime = document.getElementById('sidebar-start-time').value;
					var endTime = document.getElementById('sidebar-end-time').value;			
					data.setPolylineCoordinates(polyline.getPath().getArray());
					if ( surveyHelper.isValidTime(startTime) && surveyHelper.isValidTime(endTime)) {
						data.setStartTime(startTime);
						data.setEndTime(endTime);
					}	
					return true;
				}, function() {  });				
			},
			hideAction: function() { sidebar.hide(); }
		});
	}

	function onEmptyPath() {
		google.maps.event.addListener(drawingManager, 'polylinecomplete', function(polyline) { 
			data.setPolylineCoordinates(polyline.getPath().getArray());
			drawingManager.setOptions({
				drawingMode: null
			});		
			mapHelper.rightClickButton(polyline);			

			surveyHelper.showNextButton(data, 'add_time', 'start', function() {
				var startTime = document.getElementById('sidebar-start-time').value;
				var endTime = document.getElementById('sidebar-end-time').value;	
				if ( surveyHelper.isValidTime(startTime) && surveyHelper.isValidTime(endTime)) {
					data.setStartTime(startTime);
					data.setEndTime(endTime);
					return true;
				}
				else { 
					return false; 
				}
			}, function() {
				var instructionsContent = document.getElementById('instructions-content');
				var errorMessage = document.createElement('p');
				errorMessage.id = 'error-message';
				errorMessage.innerHTML = 'Please enter your start and end time.';
				instructionsContent.appendChild(errorMessage);

				var sidebar = document.getElementById('instructions-sidebar');
				sidebar.style.height = (sidebar.offsetHeight + 30) + 'px';
				map.controls[google.maps.ControlPosition.RIGHT_CENTER].clear();
				map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(sidebar);

				setTimeout(function() { errorMessage.style.backgroundColor = oldColor; }, 1500);
			});
		});

		surveyHelper.instructions.create(drawingManager, { 
			content: instructionsPrimary,
			action: function() { 
				sidebar.show(); 
				sidebar.toggleHelp();

				google.maps.event.addDomListener(document.getElementById('sidebar-start-time'), 'focus', onFocusInputField);
				google.maps.event.addDomListener(document.getElementById('sidebar-start-time'), 'blur', onBlurInputField);				
				google.maps.event.addDomListener(document.getElementById('sidebar-end-time'), 'focus', onFocusInputField);
				google.maps.event.addDomListener(document.getElementById('sidebar-end-time'), 'blur', onBlurInputField);				
			},
			hideAction: function() { sidebar.hide(); }
		});
	}	

	surveyHelper.showProgress(2,4, 'Draw your path.');

	var instructionsPrimary = [
		{ 
			content: '<h2>What path did you take around campus yesterday?</h2>'+
					'<hr />'+
					'<p>The campus boundary is indicated on the map by a black line.</p>'+
					'<p>Trace the path you took around campus yesterday starting from where you arrived on campus.  When you\'re done drawing, enter the time you arrived on campus and the time you left campus, formatted as X:XXam.</p>'+
					'<p>Click on the map to start drawing.</p>'
			,
			buttonText: 'START'
		}
	];

	var instructionsSidebar = '<div id="instructions-content">'+
									'<h2>Instructions</h2>'+
									'<p>Draw the path that you took around campus yesterday.</p>'+								
									'<p>When did your path start?  When did it end?  Make sure to include the time of day (am/pm).</p>'+
								'</div><!-- #instructions-content -->'+
								'<p>'+
								'<form>'+
									'<div id="start-end-time-question">'+
										'<label for="start-time">Start Time</label>'+
										'<br />'+
										'<input name="start-time" id="sidebar-start-time" value="X:XXam"/>'+
									'</div>'+
									'<div id="start-end-time-question">'+
										'<label for="end-time">End Time</label>'+
										'<br />'+
										'<input name="end-time" id="sidebar-end-time" value="X:XXpm"/>'+
									'</div>'+
								'</form>'+
								'</p>'+
								'<p>When you\'re done, click the button at the bottom of the page to advance to the next step.</p>';

	var helpContent = '<p>You can click reset to clear your path and start over, or go back to the tutorial.</p>'+
							'<div class="sidebar-button">'+
								'<a href="../../dowsing-js/reset.php"><button id="reset-button" class="dowsing-button">RESET</button></a>'+
							'</div><!-- .sidebar-button -->'+
							'<div class="sidebar-button">'+
								'<a href="../tutorial/index.php"><button id="back-to-tutorial-button" class="dowsing-button dowsing-button-grey">BACK TO TUTORIAL</button></a>'+
							'</div><!-- .sidebar-button -->';

	var sidebar = surveyHelper.sidebar.create({ 
		content: instructionsSidebar, 
		height: 395,
		sidebarId: 'instructions-sidebar',
		help: {
			teaser: 'Stuck?  Need help?',
			teaserId: 'help-teaser',
			content: helpContent,
			contentId: 'help-content'
		}
	});	

	function onFocusInputField(event) {
		event.srcElement.value = '';
		event.srcElement.style.color = '#000000';
	}

	function onBlurInputField(event) {
		if ( event.srcElement.value === '' ) {
			if ( event.srcElement.id == 'sidebar-start-time' )
				event.srcElement.value = 'X:XXam';
			else if ( event.srcElement.id == 'sidebar-end-time' )
				event.srcElement.value = 'X:XXpm';
			event.srcElement.style.color = '#696969';
		}
 	}

	var campus = [
		new google.maps.LatLng(41.79646264332723, -87.60611236095428),
		new google.maps.LatLng(41.79647961077208, -87.6044574379921),
		new google.maps.LatLng(41.795458728177614, -87.60444670915604),
		new google.maps.LatLng(41.795458728177614, -87.60370641946793),
		new google.maps.LatLng(41.795136340822026, -87.60371446609497),
		new google.maps.LatLng(41.7951844162323, -87.59798526763916),
		new google.maps.LatLng(41.791519269774085, -87.59792625904083),
		new google.maps.LatLng(41.791556035401065, -87.59567588567734),
		new google.maps.LatLng(41.78967813333251, -87.59562492370605),
		new google.maps.LatLng(41.78976015128859, -87.59144872426987),
		new google.maps.LatLng(41.788662798910146, -87.59142190217972),
		new google.maps.LatLng(41.78868542492204, -87.59029000997543),
		new google.maps.LatLng(41.7883092664371, -87.59029000997543),
		new google.maps.LatLng(41.78832057950642, -87.5889864563942),
		new google.maps.LatLng(41.784592815115744, -87.58976966142654),
		new google.maps.LatLng(41.784490991499595, -87.58988231420517),
		new google.maps.LatLng(41.784476849317905, -87.59037584066391),
		new google.maps.LatLng(41.78432128511333, -87.59072989225388),
		new google.maps.LatLng(41.784222289513934, -87.59093105792999),
		new google.maps.LatLng(41.78416006363034, -87.59110003709793),
		new google.maps.LatLng(41.78413460756964, -87.59137630462646),
		new google.maps.LatLng(41.78415723517962, -87.6051977276802),
		new google.maps.LatLng(41.785288605498216, -87.60520040988922),
		new google.maps.LatLng(41.7852829486963, -87.60591387748718)
	].reverse();

	var illinois = [
		new google.maps.LatLng(42.5116, -90.6290),
		new google.maps.LatLng(42.4924, -87.0213),
		new google.maps.LatLng(41.7641, -87.2067),
		new google.maps.LatLng(41.7611, -87.5226),
		new google.maps.LatLng(39.6417, -87.5336),
		new google.maps.LatLng(39.3566, -87.5308),
		new google.maps.LatLng(39.1386, -87.6517),
		new google.maps.LatLng(38.9445, -87.5157),
		new google.maps.LatLng(38.7294, -87.5047),
		new google.maps.LatLng(38.6115, -87.6146),
		new google.maps.LatLng(38.4944, -87.6544),
		new google.maps.LatLng(38.3740, -87.7780),
		new google.maps.LatLng(38.2856, -87.8371),
		new google.maps.LatLng(38.2414, -87.9758),
		new google.maps.LatLng(38.1454, -87.9291),
		new google.maps.LatLng(37.9788, -88.0225),
		new google.maps.LatLng(37.8900, -88.0458),
		new google.maps.LatLng(37.7881, -88.0321),
		new google.maps.LatLng(37.6349, -88.1529),
		new google.maps.LatLng(37.5097, -88.0609),
		new google.maps.LatLng(37.4149, -88.4152),
		new google.maps.LatLng(37.2828, -88.5086),
		new google.maps.LatLng(37.1428, -88.4221),
		new google.maps.LatLng(37.0585, -88.4990),
		new google.maps.LatLng(37.1428, -88.7256),
		new google.maps.LatLng(37.2128, -88.9453),
		new google.maps.LatLng(37.1559, -89.0689),
		new google.maps.LatLng(37.0376, -89.1650),
		new google.maps.LatLng(36.9894, -89.2873),
		new google.maps.LatLng(37.1505, -89.4356),
		new google.maps.LatLng(37.2762, -89.5345),
		new google.maps.LatLng(37.3996, -89.4315),
		new google.maps.LatLng(37.6936, -89.5358),
		new google.maps.LatLng(37.9767, -89.9670),
		new google.maps.LatLng(38.2587, -90.3790),
		new google.maps.LatLng(38.6169, -90.2376),
		new google.maps.LatLng(38.7573, -90.1744),
		new google.maps.LatLng(38.8247, -90.1167),
		new google.maps.LatLng(38.8846, -90.1799),
		new google.maps.LatLng(38.9680, -90.4504),
		new google.maps.LatLng(38.8654, -90.5905),
		new google.maps.LatLng(39.0405, -90.7086),
		new google.maps.LatLng(39.2301, -90.7306),
		new google.maps.LatLng(39.3173, -90.8350),
		new google.maps.LatLng(39.3853, -90.9338),
		new google.maps.LatLng(39.5559, -91.1398),
		new google.maps.LatLng(39.7262, -91.3554),
		new google.maps.LatLng(39.8570, -91.4406),
		new google.maps.LatLng(39.9940, -91.4941),
		new google.maps.LatLng(40.1694, -91.5120),
		new google.maps.LatLng(40.3497, -91.4667),
		new google.maps.LatLng(40.4166, -91.3939),
		new google.maps.LatLng(40.5566, -91.4021),
		new google.maps.LatLng(40.6265, -91.2524),
		new google.maps.LatLng(40.6963, -91.1151),
		new google.maps.LatLng(40.8232, -91.0890),
		new google.maps.LatLng(40.9312, -90.9792),
		new google.maps.LatLng(41.1642, -91.0162),
		new google.maps.LatLng(41.2355, -91.1055),
		new google.maps.LatLng(41.4170, -91.0368),
		new google.maps.LatLng(41.4458, -90.8487),
		new google.maps.LatLng(41.4417, -90.7251),
		new google.maps.LatLng(41.5816, -90.3516),
		new google.maps.LatLng(41.7713, -90.2637),
		new google.maps.LatLng(41.9023, -90.1538),
		new google.maps.LatLng(42.0819, -90.1758),
		new google.maps.LatLng(42.2021, -90.3598),
		new google.maps.LatLng(42.2936, -90.4395),
		new google.maps.LatLng(42.4032, -90.5356),
		new google.maps.LatLng(42.4843, -90.6564)
	];

	var shading = new google.maps.Polygon({
		paths: [ illinois, campus ],
		fillOpacity: 0.3,
		strokeWeight: 5
	});
	shading.setMap(map);		
}

google.maps.event.addDomListener(window, 'load', initialize);