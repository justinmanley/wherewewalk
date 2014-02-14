var spatialsurvey = function(map, doc) {

	var map = map;

	// ---------------------------------------------------------------
	var timeAndPlace = function(data)
	// ---------------------------------------------------------------
	//		data = 
	// 		{
	//			time     : number from 0 - 23
	// 			position : google.maps.LatLng object 
	// 		}
	{
		var that = {};

		var getTime = function() { return data.time; };
		that.getTime = getTime;

		var getPosition = function() { return data.position; };
		that.getPosition = getPosition; 

		return that;
	}

	// ----------------------------------------------------------------
	var TransitType = function() 
	// ----------------------------------------------------------------
	{
		//
	}

	// ----------------------------------------------------------------
	var personPath = function(data) 
	// ----------------------------------------------------------------
	/*		
		data = 
			{
				path 	 	   : Array of LatLng coordinates
				timestamps     : Array of TimeAt objects
				start-time	   : timeAndPlace objects
				end-time	   : timeAndPlace object
				transit-type   : 
				day			   : Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday 
		
				next-page-name : NOT USED in personPath
			}                                         
	*/
	{
		// var doc = doc;
		var data = data || {};
		var that = {};

		// verbose should be true only in a development environment
		var verbose = true;
		var dataStringProperties = ['timestamps'];

		var debug = function(object, description) {
			if (verbose) {
				if (typeof description !== 'undefined')
					console.log(description);			
				console.log(object);			
			}
		}

		var setAttr = function(property, value) { data[property] = value; }
		var getAttr = function(property) { return data[property]; };

		// create getters, setters, and add property to the toString method
		var addProperty = function(property) {
			that['set' + property.capitalize()] = function(value) { setAttr(property, value); };
			that['get' + property.capitalize()] = function() { return getAttr(property); };

			dataStringProperties.push(property);
		}

		// takes an array of LatLng coordinates: i.e. input should be the result of polyline.getPath().getArray()
		var setPath = function(path) { data.path = path };
		that.setPath = setPath;

		// returns an array of LatLng coordinates
		var getPath = function() { return data.path || new Array(); };
		that.getPath = getPath;

		addProperty('startTime');
		addProperty('endTime');
		addProperty('timestamps');

		var getPolyline = function() {
			if (typeof data.polyline === 'undefined') {
				var polyline = new google.maps.Polyline({
					path: getPath(),
					strokeColor: '`',
					strokeWeight: 3,
					clickable: false
				});
				data.polyline = polyline;
			}
			return data.polyline;
		}
		that.getPolyline = getPolyline;

		var getTimestamps = function() {
			var timestampWindows = doc.getElementsByClassName('timestamp-form');
			debug(timestampWindows, 'timestampWindows');
			var timestamps = [];
			for(var i = 0; i < timestampWindows.length; i++) {

				var time = timestampWindows[i].getElementsByClassName('timestamp')[0].value;
				var lat = timestampWindows[i].getElementsByClassName('timestamp-position-lat')[0].value;
				var lng = timestampWindows[i].getElementsByClassName('timestamp-position-lng')[0].value;

				timestamps.push({ 'time': time, 'position': { 'lat': lat, 'lng': lng }});
			}
			return timestamps;
		}		

		var toString = function() {
			var stringable = new Object();		
			stringable.path = data.path.map(function(p) { return { lat: p.lat(), lng: p.lng() }; });

			data.timestamps = getTimestamps();
			debug(getTimestamps(), 'timestamps');

			for (i = 0; i < dataStringProperties.length; i++) {
				var name = dataStringProperties[i];
				if (data.hasOwnProperty(name)) { stringable[name] = data[name]; };	
			}
			return JSON.stringify(stringable); 
		};
		that.toString = toString;

		var display = function(callback) {
			load(function(){
				getPolyline().setMap(map);
				mapcalc(map, doc).distributeTimeStamps(getPolyline(), that.getStartTime(), that.getEndTime());
			}, callback);			
		};
		that.display = display;

		// load data from previous screens
		var load = function(internalCallback, userCallback) {
			conn = new XMLHttpRequest();
			conn.overrideMimeType('application/json');
			conn.open('GET', '../polyline.php', true);
			conn.onreadystatechange = function() {
				if (this.readyState !== 4 ) return; 
				if (this.status !== 200 ) return; 
				debug(this.responseText);
				data = eval("(" + JSON.parse(this.responseText) + ")");
				setPath(data.path.map(createLatLng));
				// debug(toString(), "toString()");
				internalCallback();
				userCallback();
			};
			conn.send();
		}

		return that;
	}

	var createLatLng = function(coord) {
		return new google.maps.LatLng(coord.lat, coord.lng);
	}

	var getContainer = function(doc, matchClass) {
		inputs = new Array(); 
	    var elems = doc.getElementsByTagName('*'), i;
	    for (i in elems) {
	        if((' ' + elems[i].className + ' ').indexOf(' ' + matchClass + ' ')
	                > -1) {
	        	inputs.push(elems[i]);
	        }
	    }
	    return inputs;
	}

	/* Add elements to the page */

// -------------------------------------------------------------------------------------
	var showButton = function(data, destination, type, currentPageName, validate, errorHandler) 
// -------------------------------------------------------------------------------------
	{
		var nextForm = doc.createElement('form');
		nextForm.id = type + '-form';
		nextForm.setAttribute('method', 'post');
		nextForm.setAttribute('action', '../advance.php');
		nextForm.innerHTML = '<input type="hidden" name="' + type + '-name" id="' + type + '-name" value="' + destination + '"/>'+
								'<input type="hidden" name="current-page-name" id="current-page-name" value="'+currentPageName+'"/>'+
								'<input type="hidden" name="path-data" id="' + type + '-path-data"/>'+
								'<button type="button" id="' + type + '-button">NEXT</button>';
		map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(nextForm);	

		google.maps.event.addDomListenerOnce(nextForm, 'click', function() {
			if ( !validate() ) {
				errorHandler();						
			}
		});

		google.maps.event.addDomListener(nextForm, 'click', function() {
			if ( validate() ) { 
				var pathData = doc.getElementById(type + '-path-data');
				pathData.setAttribute('value', data.toString());
				nextForm.submit(); 
			} 
			else {
				var startTimeForm = doc.getElementById('sidebar-start-time');
				var endTimeForm = doc.getElementById('sidebar-end-time');

				var oldColor = startTimeForm.style.backgroundColor;

				startTimeForm.style.backgroundColor = '#ff4e4e';
				endTimeForm.style.backgroundColor = '#ff4e4e';

				setTimeout(function() { startTimeForm.style.backgroundColor = oldColor; }, 1500);
				setTimeout(function() { endTimeForm.style.backgroundColor = oldColor; }, 1500);
			}
		});		
	}

	// -------------------------------------------------------------
	var showNextButton = function(data, destination, currentPageName, validate, errorHandler) 
	// -------------------------------------------------------------
	{
		showButton(data, destination, 'next-page', currentPageName, validate, errorHandler);
	}

	// -------------------------------------------------------------
	var showPreviousButton = function(data, destination, currentPageName, validate, errorHandler) 
	// -------------------------------------------------------------
	{
		showButton(data, destination, 'previous-page', currentPageName, validate, errorHandler);
	}

	// -------------------------------------------------------------
	var timestampOpenedContent = function(position, timeString) 
	// -------------------------------------------------------------
	{
		if ( typeof timeString === 'undefined') { var timeString = ''; }		
		var info = document.createElement('div');
		info.setAttribute('class', 'timestamp-opened timestamp-container');


		info.innerHTML = '<form class="timestamp-form" onclick="false">'+
				'<br />'+
				'<input type="text" name="time" class="timestamp" value="'+timeString+'"/>'+
				'<input type="hidden" name="position-lat" class="timestamp-position-lat" value="' + position.lat() + '"/>'+
				'<input type="hidden" name="position-lng" class="timestamp-position-lng" value="' + position.lng() + '"/>'+
			'</form>';
		var infoLabel = document.createElement('label');
		infoLabel.setAttribute('class', 'timestamp-label');
		infoLabel.setAttribute('for', 'time');
		infoLabel.innerHTML = 'Time';
		info.insertBefore(infoLabel, info.firstChild);	

		function getTime() {
			return info.querySelector('.timestamp').value;
		}

		function clearTime() {
			info.querySelector('.timestamp').value = '';
		}

		return {
			'content': info,
			'label': infoLabel,
			'getTime': getTime,
			'clearTime': clearTime
		};
	}

	// --------------------------------------------------------------
	var timestampClosedContent = function(position, timeString) 
	// --------------------------------------------------------------
	{
		if ( typeof timeString === 'undefined') { var timeString = ''; }
		var placeholder = document.createElement('div');

		var label = document.createElement('div');
		label.setAttribute('class', 'timestamp-label');
		label.innerHTML = timeString;

		var indicatorColor = new MultiColorGradient();
		indicatorColor.setNumberRange([5.5, 9, 13, 15, 21]);
		indicatorColor.setGradient(['#000080', '#ffea00', '#fff04d', '#ffea00', '#000080']);
		indicatorColor.generateGradient();

		var daytimeIndicator = document.createElement('div');
		daytimeIndicator.setAttribute('class', 'daytime-indicator');
		if (timeString !=='')
			daytimeIndicator.setAttribute('style', 'background-color: ' + '#' + String(indicatorColor.colorAt(timestringToInteger(timeString))));

		placeholder.setAttribute('class', 'timestamp-closed timestamp-container');
		placeholder.innerHTML = '<form class="timestamp-form">'+
				'<input type="hidden" name="time" class="timestamp" value="'+timeString+'"/>'+				
				'<input type="hidden" name="position-lat" class="timestamp-position-lat" value="' + position.lat() + '"/>'+
				'<input type="hidden" name="position-lng" class="timestamp-position-lng" value="' + position.lng() + '"/>'+
			'</form>';
		placeholder.insertBefore(label, placeholder.firstChild);
		placeholder.insertBefore(daytimeIndicator, placeholder.firstChild);

		function updateTime(updatedTimeString) {
			label.innerHTML = updatedTimeString;
			placeholder.querySelector('.timestamp').value = updatedTimeString;			
		}

		function updateColor(updatedTimeString) {
			daytimeIndicator.setAttribute('style', 'background-color: ' + '#' + String(indicatorColor.colorAt(timestringToInteger(updatedTimeString))));
		}

		return {
			'content': placeholder,
			'label': label,
			'updateTime': updateTime,
			'updateColor': updateColor
		};
	}

// ----------------------------------------------------------------------
	var isValidTime = function(timeString) 
// ----------------------------------------------------------------------
	{
		var regex = /^(\d|[1][0-2])(:([0-5]\d))?\s?(AM|PM)$/i;
		return regex.test(timeString);
	}

// ---------------------------------------------------------------
	var getIcon = function()
// ---------------------------------------------------------------
	{
		return {
			url: "../marker.png",
			anchor: new google.maps.Point(10,10)
		};
	}

// ---------------------------------------------------------------------
	var getCloseButton = function(content)
// ---------------------------------------------------------------------	
	{
		var imgs = Array.prototype.slice.apply(content.parentNode.getElementsByTagName('img'));
		resultImgs = [];
		for (var i = 0; i < imgs.length; i++) {
			if (imgs[i].src.indexOf('close-icon.png') !== -1) {
				resultImgs.push(imgs[i]);
			}
		}
		return resultImgs[0];
	}

// ---------------------------------------------------------------------
	var infoBoxManager = (function()
// ---------------------------------------------------------------------
	{
		var groups = {};
		var init = function(identifier) {
			groups[identifier] = [];
		};
		var register = function(identifier, infoObject) {
			groups[identifier].push(function() {
				if ( infoObject.hasOwnProperty('setMap') ) // user has passed in an infoBox
					infoObject.setMap(null); 
				if ( infoObject.hasOwnProperty('infoBox') ) // user has passed in an infoObject
					infoObject.infoBox.setMap(null);
				if ( infoObject.hasOwnProperty('anchor') )
					infoObject.anchor.setMap(null);
			});
		};
		var clear = function(identifier) {
			if ( !groups.hasOwnProperty(identifier) ) {
				throw "There is no InfoBox group answering to that identifier.";
			} 
			else {
				for (var i = 0; i < groups[identifier].length; i++) {
					groups[identifier][i]();
				}
				groups[identifier] = [];
			}
		};
		return {
			init: init,
			clear: clear,
			register: register
		};

	}());

// ---------------------------------------------------------------------
	var timestamp = function(polyline, position, timeString, openOnCreation)
// ---------------------------------------------------------------------	
	{
		var timestamp = {};
		var open = typeof openOnCreation === 'undefined' ? false : openOnCreation;
		var openedContent = timestampOpenedContent(position, timeString);
		var closedContent = timestampClosedContent(position, timeString);
	
		timestamp.create = function() {
			if ( timestamp.isOpen() ) {
				timestamp.opened.open(map, timestamp.pyramid);
				timestamp.pyramid.setMap(map);
				open = true;
			}				
			else {
				timestamp.closed.open(map, timestamp.pyramid);
				timestamp.pyramid.setMap(map);				
				open = false;					
			}
			return timestamp;
		}

		var overlay = new google.maps.OverlayView();
		overlay.draw = function() {};
		overlay.setMap(map);

		closedContent.content.addEventListener('mousedown', function() {
			addEventListener('mousemove', dragTimestamp, true);
			google.maps.event.clearListeners(closedContent.label, 'click');
		}, false);
		addEventListener('mouseup', function() {
			google.maps.event.addDomListener(closedContent.label, 'click', function() { timestamp.open();   });
			removeEventListener('mousemove', dragTimestamp, true);			
		}, false);

		var startPixelY;
		var startPixelX;

		function dragTimestamp(event) {
			pauseEvent(event);

			var proj = overlay.getProjection();
			var pos = timestamp.closed.getPosition();
			var p = proj.fromLatLngToContainerPixel(pos);					

			if ( typeof startPixelX !== 'undefined' ) {
				var newPoint = new google.maps.Point(p.x + (event.x - startPixelX), p.y + (event.y - startPixelY));
				var newLatLng = mapcalc(map, doc).closestPointOnPolyline(polyline, proj.fromContainerPixelToLatLng(newPoint));
				timestamp.closed.setPosition(newLatLng);
				timestamp.pyramid.setPosition(newLatLng);
			}

			startPixelX = event.x;
			startPixelY = event.y;
		}

		function pauseEvent(e){
		    if(e.stopPropagation) e.stopPropagation();
		    if(e.preventDefault) e.preventDefault();
		    e.cancelBubble=true;
		    e.returnValue=false;
		    return false;
		}		

		timestamp.opened = new InfoBox({
			content: openedContent.content,
			position: position,
			boxStyle: {
				background: '#ffffff',
				opacity: 1,
				padding: '5px',
				width: '65px',
				height: '60px',
				'border-radius': '7px'
			},
			closeBoxURL: "../images/close-icon.png",
			pixelOffset: new google.maps.Size(-34,-95),
			map: map
		});
		timestamp.closed = new InfoBox({
			content: closedContent.content,
			position: position,
			boxStyle: {
				background: '#ffffff',
				opacity: 1,
				padding: '5px',
				width: '65px',
				height: '20px',
				'border-radius': '7px'
			},
			closeBoxURL: "",
			pixelOffset: new google.maps.Size(-34,-55)
		});		
		timestamp.pyramid = new google.maps.Marker({
			icon: { url: "../images/pyramid.png", anchor: new google.maps.Point(10,30) },
			shape: { type: "rect", coords: [0,0,20,20] },
			position: position,
			draggable: true,
			map: map		
		});
		timestamp.open = function() {
			timestamp.opened.open(map, timestamp.pyramid);
			timestamp.pyramid.setMap(map);
			open = true;
		}
		timestamp.close = function() {
			var updatedTime = openedContent.getTime();
			if (isValidTime(updatedTime)) {
				timestamp.opened.setMap(null);

				closedContent.updateTime(updatedTime);
				closedContent.updateColor(updatedTime);	

				timestamp.closed.open(map, timestamp.pyramid);
				open = false;							
			} 
			else {
				openedContent.clearTime();
				var oldColor = openedContent.content.querySelector('.timestamp').style.backgroundColor;
				openedContent.content.querySelector('.timestamp').style.backgroundColor = '#ff4e4e';
				setTimeout(function() { openedContent.content.querySelector('.timestamp').style.backgroundColor = oldColor }, 1000);
			}
		}
		timestamp.isOpen = function() {
			return open;
		}
		timestamp.savePosition = function(position) {
			timestamp.opened.getContent().getElementsByClassName('timestamp-position-lat')[0].value = position.lat();
			timestamp.opened.getContent().getElementsByClassName('timestamp-position-lng')[0].value = position.lng();

			timestamp.closed.getContent().getElementsByClassName('timestamp-position-lat')[0].value = position.lat();
			timestamp.closed.getContent().getElementsByClassName('timestamp-position-lng')[0].value = position.lng();	
		}

		google.maps.event.addListener(timestamp.pyramid, 'drag', function(event) {
			var dragPosition = mapcalc(map, doc).closestPointOnPolyline(polyline, timestamp.pyramid.getPosition());
			timestamp.pyramid.setPosition(dragPosition);		
		});		
		google.maps.event.addListener(timestamp.pyramid, 'dragend', function(event) {
			timestamp.closed.setPosition(event.latLng);
			timestamp.savePosition(event.latLng);
		});			

		google.maps.event.addDomListener(openedContent.label, 'click', function() { timestamp.close();  });
		google.maps.event.addDomListener(closedContent.label, 'click', function() { timestamp.open();   });

		google.maps.event.addListener(timestamp.opened, 'closeclick', function() {
			timestamp.pyramid.setMap(null);
			timestamp.opened.setMap(null);
			timestamp.closed.setMap(null);
		});	

		return timestamp;
	}

/* SUB-MODULE: spatialsurvey.instructions */
// -----------------------------------------------------------------------------------
	var instructions = (function() 
// -----------------------------------------------------------------------------------
	{
		var data = {};
		data.content = [];
		primaryActive = false;
		sidebarActive = false;


		var init = function(drawingManager, options, action) {
			if (typeof options !== 'undefined') {
				if (typeof options.content !== 'undefined') {
					setPrimaryContent(options.content);
					primaryActive = true;
				}
				if (typeof options.sidebar !== 'undefined') {
					setSidebarContent(options.sidebar);
					sidebarActive = true;
				}
				if ( action && Object.prototype.toString.call(action) === '[object Function]') {
					data.action = action;
				}
			}

			// initialize main instructions
			if ( primaryActive ) { setupPrimaryInstructions(); }

			// initialize instructions sidebar
			if ( sidebarActive ) { setupSidebarInstructions(); }

			if ( primaryActive ) { 
				showPrimaryInstructions(drawingManager);	

				// event handler to close welcome screen
				var welcome_close = doc.getElementsByClassName('close-box')[0];
				google.maps.event.addDomListener(welcome_close, 'click', function() {
					startDrawing(drawingManager, initDrawingManager);
				});

				// if user clicks outside of welcome screen, then start drawing
				var initDrawingManager = google.maps.event.addListener(map, 'click', function() {
					startDrawing(drawingManager, initDrawingManager);				
				});								
			}					
		}
		var showProgress = function(currentScreen, max, description) 
		{
			var progressBar = doc.createElement('div');
			var progressIndicator = doc.createElement('div');
			var progressText = doc.createElement('div');
			progressBar.id = 'progress-bar';
			progressIndicator.id = 'progress-indicator';
			progressText.id = 'progress-text';

			var widthFormat = /^([0-9]*)px$/;
			// var progressBarWidth = parseInt(widthFormat.exec(getCSSRule('#progress-bar').style.width)[1]);
			var progressBarWidth = 400;

			progressIndicator.style.width = (currentScreen/max)*progressBarWidth + 'px';

			progressText.innerHTML = currentScreen + ' : ' + description;

			progressBar.appendChild(progressIndicator);
			progressBar.appendChild(progressText);
			map.controls[google.maps.ControlPosition.TOP_CENTER].push(progressBar);				
		}

		function setupPrimaryInstructions() {
			var extra = doc.getElementById('extra');
			extra.innerHTML = '<div id="instructions-main">'+
				'<div class="close-box">'+
					'<img src="../images/close-icon.png"/>'+
				'</div>'+				
				'<div id="instructions-main-content">'+
				'</div><!-- #instructions-main-content -->'+
				'<button id="next-instruction">Next</button>'+				
			  '</div><!-- #instructions-main -->';
		}
		function setupSidebarInstructions() {
			var instructions = doc.createElement('div');
			instructions.id = 'instructions-sidebar';

			instructions.innerHTML = getSidebarContent();

			// initialize the instructions sidebar to be hidden
			instructions.style.display = 'none';
			instructions.style.height = '302px';

			map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(instructions);
		}
		function showPrimaryInstructions(drawingManager) {
			data.primaryIsVisible = true;
			var instructions_main = doc.getElementById('instructions-main');
			var instructions_main_content = doc.getElementById('instructions-main-content');

			instructions_main.style.display = 'block';

			if (doc.getElementById('instructions-sidebar') != null) { 			
				doc.getElementById('instructions-sidebar').style.display = 'none';			
			}				

			// initialize instructions_main screen
		    var instructions_main_screen_index = 0;
		    var content = getPrimaryContent();
		    var nextButton = doc.getElementById('next-instruction');

		    instructions_main_content.innerHTML = content[instructions_main_screen_index].content;
		    nextButton.innerHTML = typeof content[instructions_main_screen_index].buttonText !== 'undefined' ? content[instructions_main_screen_index].buttonText : 'NEXT';

		    google.maps.event.addDomListener(nextButton, 'click', function() {
				if (instructions_main_screen_index < content.length - 1) { 
				    instructions_main_screen_index += 1;
				    instructions_main_content.innerHTML = content[instructions_main_screen_index].content;
				    nextButton.innerHTML = typeof content[instructions_main_screen_index].buttonText !== 'undefined' ? content[instructions_main_screen_index].buttonText : 'NEXT';
				}
				else { 
					if ( typeof data.action !== 'undefined' ) { 
						hidePrimaryInstructions();
						data.action(); 
					}
					else { startDrawing(drawingManager); }
				}
			});
		}
		function hidePrimaryInstructions() {
			data.primaryIsVisible = false;
			doc.getElementById('instructions-main').style.display = 'none';
			google.maps.event.clearListeners(doc.getElementById('next-instruction'), 'click');

			if ( sidebarActive ) { doc.getElementById('instructions-sidebar').style.display = 'block'; }
		}
		function startDrawing(drawingManager, initDrawingManager) {
			hidePrimaryInstructions();		
			drawingManager.setMap(map);			

			// google.maps.event.addDomListener(doc.getElementById('instructions-content'), 'click', function() {
			// 	// here is where you set the time in the primary instructions thing
			// 	showPrimaryInstructions(drawingManager);
			// });
			google.maps.event.removeListener(initDrawingManager);				
		}

		function setPrimaryContent(array) { data.content = array; }	
		function getPrimaryContent() { return data.content; }
		function setSidebarContent(content) { data.sidebar = content; }
		function getSidebarContent() { return data.sidebar; }

		function getStartTime() {
			if (data.primaryIsVisible)
				var userStartTime = doc.getElementById('primary-start-time');
			else if (data.primaryIsVisible === false)
				var userStartTime = doc.getElementById('sidebar-start-time')
			return userStartTime.value;
		}
		function getEndTime() {
			if (data.primaryIsVisible)
				var userEndTime = doc.getElementById('primary-end-time');
			else if (data.primaryIsVisible === false)
				var userEndTime = doc.getElementById('sidebar-end-time')
			return userEndTime.value;
		}

		return {
			'init': init,
			'setPrimaryContent': setPrimaryContent,
			'getPrimaryContent': getPrimaryContent,
			'showProgress': showProgress
		}
	}());

	var tutorial = (function() {
		function create(drawingManager) {
			var tutorialBox = doc.createElement('div');
			tutorialBox.id = 'tutorial-fixed-box';
			tutorialBox.innerHTML = 'Click anywhere to start drawing.';
			tutorialBox.style.width = '250px';

			polylineIsCompleted = false;

			var polyline;

			map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(tutorialBox);	

			addEventListener('click', onFirstPoint);	

			infoBoxManager.init('interactive');

			function onFirstPoint() {
				var points = 1;					
				fixedTutorialBox(tutorialBox, function() {
					tutorialBox.innerHTML = 'Click somewhere else to draw a path.  To start, draw a path with three segments.';
					tutorialBox.style.width = '440px';
				});	
				addEventListener('click', onThirdPoint);
				removeEventListener('click', onFirstPoint);

				function onThirdPoint(event) {	
					points += 1;			
					if ( points > 3 ) {
						var overlay = new google.maps.OverlayView();
						overlay.draw = function() {};
						overlay.setMap(map);
						overlay.onAdd = function() {
							var proj = overlay.getProjection(); 

							var thirdPointPosition = proj.fromContainerPixelToLatLng(new google.maps.Point(event.clientX, event.clientY));

							interactiveTutorialBox('Click again on the point you just drew to complete the path.', 300, thirdPointPosition);
						};
					}
					if ( points == 4 ) {
						google.maps.event.addListenerOnce(drawingManager, 'polylinecomplete', function(obj) {
							removeEventListener('click', onThirdPoint);
							onCompletePolyline(obj);
						});						
					}
				}			
			}			

			function onCompletePolyline(obj) {
				mapcalc(map, doc).rightClickButton(obj);
				polyline = obj;
				drawingManager.setOptions({
					drawingMode: null
				});	
				teachEditPolyline();

				if ( polylineIsCompleted )	{
					teachEditPolyline();
				}						

				google.maps.event.addListenerOnce(drawingManager, 'polylinecomplete', function(obj) {
					drawingManager.setOptions({ drawingMode: null });	
					polyline = obj;
					mapcalc(map, doc).rightClickButton(polyline);
					polylineIsCompleted = true;
				});
			}				

			function teachEditPolyline() {
				fixedTutorialBox(tutorialBox, function() {
					tutorialBox.innerHTML = 'Nice!  Now that you\'ve drawn a path, you can modify it by deleting or dragging vertices.  Give it a try!';
					tutorialBox.style.width = '560px';							
				});

				editPolyline = 0;
				google.maps.event.addListener(polyline.getPath(), 'insert_at', function() {
					editPolyline += 1;
					if ( editPolyline > 2 ) { teachTimestamps(); }
				});
				google.maps.event.addListener(polyline.getPath(), 'remove_at', function() {
					editPolyline += 1;
					if ( editPolyline > 2 ) { teachTimestamps(); }					
				});
				google.maps.event.addListener(polyline.getPath(), 'set_at', function() {
					editPolyline += 1;
					if ( editPolyline > 2 ) { teachTimestamps(); }					
				});
			}

			function teachTimestamps() {
				polyline.setOptions({ editable: false });
				var timestamps = mapcalc(map, doc).distributeTimeStamps(polyline, '9 am', '3 pm');

				fixedTutorialBox(tutorialBox, function() {
					tutorialBox.innerHTML = 'Each marker on the path represents a time.';
					tutorialBox.style.width = '560px';	
				}, true, function() {
					fixedTutorialBox(tutorialBox, function() {
						tutorialBox.innerHTML = 'You can drag times around, or edit them by clicking on the time.  Give it a try!';
						tutorialBox.style.width = '560px';

						var timestampLearning = 0;
						for (i = 0; i < timestamps.length; i++) {
							google.maps.event.addListener(timestamps[i].pyramid, 'dragend', function() {
								timestampLearning += 1;
								if ( timestampLearning > 2 ) {
									endTutorial();
								}
							});
							addEventListener('mouseup', function() {
								timestampLearning += 1;
								if ( timestampLearning > 5 ) {
									console.log(timestampLearning);
									endTutorial();
									removeEventListener('mouseup', arguments.callee, false);
								}								
							});
						}
					});					
				});

				google.maps.event.addListener(map, 'click', function(event) {			
					var tolerance = 0.05*Math.pow(1.1, -map.getZoom());
					if (google.maps.geometry.poly.isLocationOnEdge(event.latLng, polyline, tolerance)) {
						var position = mapcalc(map,doc).closestPointOnPolyline(polyline, event.latLng);
						timestamp(polyline, position, '', true).create();
					}			
				});				
			}

			function endTutorial() {
				fixedTutorialBox(tutorialBox, function() {
					tutorialBox.innerHTML = 'Great!  You\'re ready for the survey.';
					tutorialBox.style.width = '160'
				}, true, function() {
					map.controls[google.maps.ControlPosition.BOTTOM_CENTER].clear();	
					showNextButton({}, 'start', 'tutorial', function() {
						return true;
					}, function() { });
				});				
			}

			function fixedTutorialBox(content, action, hasButton, buttonAction) {
				map.controls[google.maps.ControlPosition.BOTTOM_CENTER].clear();	
				infoBoxManager.clear('interactive');	

				action();

				if ( hasButton === true ) {
					button = doc.createElement('button');
					button.id = 'tutorial-button';
					button.innerHTML = 'OK';
					content.appendChild(button);

					google.maps.event.addDomListener(button, 'click', function() {
						buttonAction();
					});
				}
				map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(content);				
			}

			function interactiveTutorialBox(text, width, position, clear) {
				if ( typeof clear === 'undefined' || clear == true )
					map.controls[google.maps.ControlPosition.BOTTOM_CENTER].clear();	

				infoBoxManager.clear('interactive');

				var tutorial = new InfoBox({
					content: '<div class="tutorial-movable-box">' + text + '</div>',
					boxStyle: {
						'background-color': '#ffffff',
						width: width + 'px',
						'font-size': '14pt',					
					},
					position: position,
					map: map,
					closeBoxURL: "",
					pixelOffset: new google.maps.Size(- width/2, -120)
				});
				var pyramid = new google.maps.Marker({
					icon: { url: "../images/pyramid.png", anchor: new google.maps.Point(10,50) },
					shape: { type: "rect", coords: [0,0,20,20] },
					position: position,
					draggable: true,
					map: map		
				});

				tutorial.open(map, pyramid);									

				infoBoxManager.register('interactive', { 'infoBox': tutorial, 'anchor': pyramid });			
			}

			function interactiveArrow() {
				//
			}
		}

		return {
			'create': create
		}
	}());

	String.prototype.capitalize = function() {
	    return this.charAt(0).toUpperCase() + this.slice(1);
	}

	// public methods and constructors for module spatialsurvey
	return {
		'personPath': personPath, 
		'showNextButton': showNextButton,
		'timestamp': timestamp,
		'instructions': instructions,
		'tutorial': tutorial,
		'isValidTime': isValidTime

	};
};

// -----------------------------------------------------------------------------
var mapcalc = function(map, doc) 
// -----------------------------------------------------------------------------
{

	var map = map;
	var verbose = false;

// -----------------------------------------------------------------------------
	var comparePoints = function(a, b) 
// -----------------------------------------------------------------------------
	{
		if (google.maps.geometry.spherical.computeDistanceBetween(a.point, a.coord) < google.maps.geometry.spherical.computeDistanceBetween(b.point, b.coord)) 
			return -1;
		if (google.maps.geometry.spherical.computeDistanceBetween(b.point, b.coord) < google.maps.geometry.spherical.computeDistanceBetween(a.point, a.coord))
			return 1;
		else
			return 0;
	}

// ----------------------------------------------------------------------------
	var placeMarker = function(point) 
// ----------------------------------------------------------------------------
	{
		var marker = new google.maps.Marker({
			position: point,
			map: map
		});
		return marker;
	}

	var validDeleteUrl = false;

// ---------------------------------------------------------------
	var getDeleteUrl = function() 
// ---------------------------------------------------------------
	{
		var deleteUrl = '../resources/closebox.png';
		if (!validDeleteUrl) {
			var request = new XMLHttpRequest();
			request.open('GET', deleteUrl, false);
			request.onreadystatechange = function() {
				if (request.readyState == 4) {
					if (request.status == 200) { validDeleteUrl = true; };
				}
			};
			request.send();
		}
		if (validDeleteUrl) { return deleteUrl;	}
		else throw "Link to delete vertex image is broken.";
	}

// --------------------------------------------------------------
	var getUndoButton = function(doc) 
// --------------------------------------------------------------
	{
		var images = doc.getElementsByTagName('img');
		for (var i = 0; i < images.length; i++) {
			console.log(images[i].src);
			if (images[i].src == 'https://maps.gstatic.com/mapfiles/undo_poly.png')
				return images[i];
		}
		return -1;
	};

// --------------------------------------------------------------
	var getDeleteButton = function(doc)
// --------------------------------------------------------------
	{
		var images = doc.getElementsByTagName('img');
		for (var i = 0; i < images.length; i++) {
			console.log(images[i].src);
			if (images[i].src == getDeleteUrl())
				return images[i];
		}
		return -1;
	};

// --------------------------------------------------------------
	var addDeleteButton = function(doc, polyline)
// --------------------------------------------------------------
	{
		var deleteButton = doc.createElement('div');
		deleteButton.setAttribute('style', 'overflow-x: hidden; overflow-y: hidden; position: absolute; width: 30px; height: 27px; top: -10px; left: 5px;');
		deleteButton.innerHTML = '<img src="' + getDeleteUrl() + '" class="deletePoly" style="height:auto; width:auto; position: absolute; left:0;"/>';
		google.maps.event.addDomListener(deleteButton, 'mouseover', function() {
			deleteButton.getElementsByTagName('img')[0].style.left = '-30px';
		});	
		google.maps.event.addDomListener(deleteButton, 'mouseout', function() {
			deleteButton.getElementsByTagName('img')[0].style.left = '0';
		});
		google.maps.event.addDomListener(deleteButton, 'mousedown', function() {
			deleteButton.getElementsByTagName('img')[0].style.left = '-60px';
		});	
		google.maps.event.addDomListener(deleteButton, 'mouseup', function() {
			deleteButton.getElementsByTagName('img')[0].style.left = '0';		
		});
		return deleteButton;

	};

// ----------------------------------------------------------------------
	var rightClickButton = function(polyline)
// ----------------------------------------------------------------------
	{
		var deleteButton = addDeleteButton(doc, polyline);
		var rightClickDiv = new InfoBox({
			content: deleteButton,
			closeBoxURL: "../images/close-icon.png",
			visible: false,
		});

		/* Need to define these methods (unfortunately) because
		 * 	1. InfoBox method isVisible() is not implemented (although documentation says it is)
		 * 	2. InfoBox attribute visible says whether the infobox is visible ON OPEN, not whether it is visible.`
		 */
		rightClickDiv.mapCalcVisibility = false;
		rightClickDiv.mapCalcShow = function() {
			rightClickDiv.show();
			rightClickDiv.mapCalcVisibility = true;
		}
		rightClickDiv.mapCalcHide = function() {
			rightClickDiv.hide();
			rightClickDiv.mapCalcVisibility = false;
		}
		rightClickDiv.mapCalcIsVisible = function() {
			return rightClickDiv.mapCalcVisibility;
		}

		google.maps.event.addListener(polyline, 'rightclick', function(point) {
			if (point.vertex != null) getUndoButton(doc).style.display = 'none';
		});	

		google.maps.event.addListener(polyline.getPath(), 'set_at', function(point) {
			if (!rightClickDiv.mapCalcIsVisible()) { getUndoButton(doc).style.display = 'block'; }
			else { getUndoButton(doc).style.display = 'none'; }
		});

		google.maps.event.addListener(polyline, 'rightclick', function(point) {
			if (point.vertex != null) {
				rightClickDiv.setPosition(point.latLng);
				rightClickDiv.mapCalcShow();
				rightClickDiv.open(map);		

				// Move the delete button if user drags its associated vertex.  Otherwise, hide it.
				var setAtListener = google.maps.event.addListener(polyline.getPath(), 'set_at', function(newpoint) {
					if (newpoint == point.vertex) 
						rightClickDiv.setPosition(polyline.getPath().getAt(newpoint));
					else {
						rightClickDiv.mapCalcHide();
					}
				});

				// This prevents the user from right-clicking many times in succession on the same
				// vertex and thereby deleting many more than one vertex.
				google.maps.event.clearListeners(deleteButton, 'click');

				google.maps.event.addDomListener(deleteButton, 'click', function(event) {
					polyline.getPath().removeAt(point.vertex);
					rightClickDiv.mapCalcHide();
				});
				google.maps.event.addDomListener(map, 'click', function() {
					rightClickDiv.mapCalcHide();
					/* If we don't clear the listener here, this is what happens:
					 *	 listener gets registered on vertex N
					 *	 vertex N is deleted
					 *	 listener still deletes vertex N on rightclick, but the number N now refers to a different vertex
					 */
					google.maps.event.clearListeners(deleteButton, 'click');
					google.maps.event.removeListener(setAtListener);
				});
			}
		});	
		return rightClickDiv;
	};

/* 
 * Latitude is treated as the dependent variable (x) and longitude is independent (y).  This is 
 * convenient because the amount of stretching in the mercator projection depends on latitude,
 * not longitude.
 */
// ------------------------------------------------------------
	var Line = function(pointSlope) 
// ------------------------------------------------------------
	{
		var line = {};
		var latToLngScalingFactor = function(lat) {
		        var unitDistanceLat = google.maps.geometry.spherical.computeDistanceBetween(
		                new google.maps.LatLng(lat - 0.1, -87.600732),
		                new google.maps.LatLng(lat + 0.1, -87.600732)
		        );

		        var unitDistanceLng = google.maps.geometry.spherical.computeDistanceBetween(
		                new google.maps.LatLng(41.790113, -87.500732),
		                new google.maps.LatLng(41.790113, -87.700732)
		        );
		        return unitDistanceLat/unitDistanceLng;
		};
		line.getSlope = function() {
			if (pointSlope.hasOwnProperty('slope')) { return pointSlope.slope; }
			else 
			{
				var top = pointSlope.point1.lng() - pointSlope.point2.lng();
				var bottom = pointSlope.point1.lat() - pointSlope.point2.lat();			
				return top/bottom;
			}
		}
		line.getIntercept = function() {
			return pointSlope.point1.lng() - line.getSlope()*pointSlope.point1.lat();
		}
		line.extrapolate = function(latitude) {
			return new google.maps.LatLng(latitude, line.getSlope()*latitude + line.getIntercept());
		}
		line.getPerpendicularThroughPoint = function(point) {
			return Line({
				'slope': latToLngScalingFactor(point.lat())*line.getPerpendicularSlope(),
				'point1': point
			});
		}
		line.distanceToLine = function(point) {
			var dlat = (pointSlope.point1.lat() - point.lat())^2;
			var dlng = (pointSlope.point1.lng() - point.lng())^2;
			return Math.sqrt(dlat + dlng);
		}
		line.getPerpendicularSlope = function () { return -1/line.getSlope(); };
		line.intersection = function(otherLine) {
			var top = line.getIntercept() - otherLine.getIntercept();
			var bottom = otherLine.getSlope() - line.getSlope();

			var lng = line.getSlope()*(top/bottom) + line.getIntercept();

			return new google.maps.LatLng(top/bottom, lng);
		}

		return line;
	}

// ---------------------------------------------------------------------------------------
	var closestPointOnPolyline = function(polyline, point)
// ---------------------------------------------------------------------------------------
	{
		var path = polyline.getPath().getArray().slice(0);
		var intersections = [];
		for (var n = 0; n < path.length - 1; n++) {
			var line = Line({'point1': path[n], 'point2': path[n+1]});
			var intersectionPoint = line.intersection(line.getPerpendicularThroughPoint(point));
			if (isBetween(path[n], path[n+1], intersectionPoint)) {
				intersections.push({
					'index': n,
					'point': intersectionPoint,
					'distance': google.maps.geometry.spherical.computeDistanceBetween(point, intersectionPoint)
				});
			}
		}
		intersections.push({
			'index': 0,
			'point': closestVertex(point, polyline),
			'distance': google.maps.geometry.spherical.computeDistanceBetween(point, closestVertex(point, polyline))

		});
		intersections.sort(function(a,b) { return a.distance - b.distance; });

		return intersections[0].point;
	}

// ----------------------------------------------------------------------------
	var isBetween = function(endpt1, endpt2, pt) 
// ----------------------------------------------------------------------------
	{
		var lat1 = (endpt1.lat() <= pt.lat()) && (pt.lat() <= endpt2.lat());
		var lat2 = (endpt2.lat() <= pt.lat()) && (pt.lat() <= endpt1.lat());
		var betweenLat = lat1 || lat2;

		var lng1 = (endpt1.lng() <= pt.lng() && pt.lng() <= endpt2.lng());
		var lng2 = (endpt2.lng() <= pt.lng() && pt.lng() <= endpt1.lng());
		var betweenLng = lng1 || lng2;

		return betweenLat && betweenLng;
	}

// takes a LatLng point and a polyline
// -----------------------------------------------------------------------------
	var closestVertex = function(point, polyline) 
// -----------------------------------------------------------------------------
	{
		var path = polyline.getPath().getArray().slice(0);
		path.sort(function(a,b) { 
			return google.maps.geometry.spherical.computeDistanceBetween(a, point) - google.maps.geometry.spherical.computeDistanceBetween(b, point);
		});
		return path[0];
	}

// ------------------------------------------------------------------------------
	var distanceAlongPolyline = function(polyline, lastVertex, nextPoint) 
// ------------------------------------------------------------------------------	
	{
		var partialPath = new google.maps.Polyline({
			path: polyline.getPath().getArray().slice(0, lastVertex).push(nextPoint)
		});
		return google.maps.geometry.spherical.computeLength(partialPath);
	}

// -------------------------------------------------------------------------------
	var distributeTimeStamps = function(polyline, startTime, endTime) 
// -------------------------------------------------------------------------------	
	{
		/* These variables remain constant, and so may safely be referenced by functions defined herein. */
		var path = polyline.getPath().getArray();
		var totalLength = google.maps.geometry.spherical.computeLength(path);
		var totalTime = getTotalTime(startTime, endTime);
		var timeDelta = 1.5;
		var numberOfTimestamps = Math.ceil(totalTime/timeDelta);
		var delta = totalLength/numberOfTimestamps;

		var timestampCollection = [];

		var segmentLength = function(i) { 
			return google.maps.geometry.spherical.computeDistanceBetween(polyline.getPath().getAt(i), polyline.getPath().getAt(i+1));
		}
		var segmentVerticalChange = function(i) {
			return google.maps.geometry.spherical.computeDistanceBetween(
				polyline.getPath().getAt(i), 
				new google.maps.LatLng(polyline.getPath().getAt(i + 1).lat(), polyline.getPath().getAt(i).lng())
			);			
		}

		var getSpilloverPastVertex = function(info) {
			if (info.currentVertex < path.length - 1) {
				var thisSegmentLength = segmentLength(info.currentVertex);
				return info.spillover + ((info.i + 1) - info.oldI)*delta - thisSegmentLength;
			}
			else return 0;
		}

		var getVerticalDistance = function(info) {
			var thisSegmentLength = segmentLength(info.currentVertex);
			var thisSegmentVerticalChange = segmentVerticalChange(info.currentVertex);
			var verticalDelta = delta*thisSegmentVerticalChange/thisSegmentLength;

			info.verticalDistance = verticalDelta;
			while ( getSpilloverPastVertex(info) > 0 ) {
				info.spillover = getSpilloverPastVertex(info);
				info.currentVertex += 1;

				if (info.currentVertex < path.length - 1) {
					var nextSegmentLength = segmentLength(info.currentVertex);
					var nextSegmentVerticalChange = segmentVerticalChange(info.currentVertex);

					var verticalSpillover = info.spillover*nextSegmentVerticalChange/nextSegmentLength;
				}
				else {
					var verticalSpillover = 0;
				}

				info.basePoint = polyline.getPath().getAt(info.currentVertex);
				info.oldI = info.i + 1;
				info.verticalDistance = verticalSpillover;
			}
			return info;
		};

		var thisTimestampInfo = {
			'basePoint': polyline.getPath().getAt(0),
			'i': 0,
			'currentVertex': 0,
			'spillover': 0,
			'oldI': 0,
			'verticalSpillover': 0
		};
		var timestamp = spatialsurvey(map, doc).timestamp(polyline, closestPointOnPolyline(polyline, thisTimestampInfo.basePoint), startTime, false);	
		timestamp.create();
		timestampCollection.push(timestamp);

		for (var i = 0; i < numberOfTimestamps; i++) {
			thisTimestampInfo = getVerticalDistance(thisTimestampInfo);
	
			if (thisTimestampInfo.currentVertex < path.length - 1) {
				var endpoint1 = polyline.getPath().getAt(thisTimestampInfo.currentVertex);
				var endpoint2 = polyline.getPath().getAt(thisTimestampInfo.currentVertex + 1);
				var line = Line({
					'point1': endpoint1, 
					'point2': endpoint2
				});

				thisTimestampInfo.basePoint = line.extrapolate(thisTimestampInfo.basePoint.lat() + Math.sgn(endpoint2.lat() - endpoint1.lat())*thisTimestampInfo.verticalDistance*metersToLat(thisTimestampInfo.basePoint));	
			}

			
			if (i == numberOfTimestamps - 1) { // last timestamp 
				timestamp = spatialsurvey(map, doc).timestamp(polyline, thisTimestampInfo.basePoint, endTime, false);
				timestamp.create();
				timestampCollection.push(timestamp);
			}
			else {
				timestamp = spatialsurvey(map, doc).timestamp(polyline, thisTimestampInfo.basePoint, incrementTimestamp(startTime, timeDelta*(i+1)), false);
				timestamp.create();
				timestampCollection.push(timestamp);
			}
			thisTimestampInfo.i++;
		}
		return timestampCollection;
	}


	// public methods and constructors
	return {
		'closestPointOnPolyline': closestPointOnPolyline, 
		'rightClickButton': rightClickButton,
		'placeMarker': placeMarker,
		'distributeTimeStamps': distributeTimeStamps
	}

};

// ---------------------------------------------------------------------
	Math.sgn = function(x) 
// ---------------------------------------------------------------------	
	{
	    return typeof x === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN;
	}

// ---------------------------------------------------------------------
	Math.sinh = function(x) 
// ---------------------------------------------------------------------
	{
		return 0.5*(Math.exp(x) - Math.exp(-x));
	}

// ---------------------------------------------------------------------
	Math.cosh = function(x) 
// ---------------------------------------------------------------------
	{
		return 0.5*	(Math.exp(x) + Math.exp(-x));
	}

// ---------------------------------------------------------------------
	Math.tanh = function(x) 
// ---------------------------------------------------------------------
	{
		return Math.sinh(x)/Math.cosh(x);
	}

// ---------------------------------------------------------------------
	Math.atanh = function(x) 
// ---------------------------------------------------------------------
	{
		return 0.5*Math.log((1+x)/(1-x));
	}

// ---------------------------------------------------------------------
	Math.cot = function(x)
// ---------------------------------------------------------------------
{
	return 1/Math.tan(x);
}

// ---------------------------------------------------------------------
	Math.sec = function(x)
// ---------------------------------------------------------------------
{
	return 1/Math.cos(x);
}

// ---------------------------------------------------------------------
	var bearing = function(point1, point2) 
// ---------------------------------------------------------------------
	{
		var top = Math.atanh(Math.sin(point2.lat()));
		var bottom = point2.lng() - equatorialIntercept(point1, point2);
		return top/bottom;
	}

// ---------------------------------------------------------------------
	var equatorialIntercept = function(point1, point2)
// ---------------------------------------------------------------------
	{
		var y1 = Math.atanh(Math.sin(point1.lat()));
		var y2 = Math.atanh(Math.sin(point2.lat()));
		var top = y2*point1.lng() - y1*point2.lng();
		var bottom = y2 - y1;
		return top/bottom;
	}

// ---------------------------------------------------------------------
	var rhumbLineLatitude = function(point1, point2, longitude)
// ---------------------------------------------------------------------
{
	var azimuth = Math.cot(bearing(point1, point2));
	var lambda = equatorialIntercept(point1, point2)
	return Math.asin(Math.tanh(azimuth*(longitude - lambda)));
}

// eccentricity from WGS84
var eccentricity = 0.08181919084;

// semi-major axis in meters
var semiMajorAxis = 6378137;

var aMap = function(map) {
	var top = 256*Math.pow(2,map.getZoom());
	var bottom = 2*Math.PI;
	return top/bottom;
}

var dx = function(map, latitude) { 
	var top = aMap(map)*Math.sec(latitude)*Math.sqrt(1 - (eccentricity*Math.sin(latitude))^2);
	var bottom = semiMajorAxis;
	return top/bottom;
}

var metersToLat = function(point) {
	var latDistance = google.maps.geometry.spherical.computeDistanceBetween(
		point,
		new google.maps.LatLng(point.lat() + 1, point.lng())
	);
	return 1/latDistance;
}

var metersToLng = function(point) {
	var lngDistance = google.maps.geometry.spherical.computeDistanceBetween(
		point,
		new google.maps.LatLng(point.lat(), point.lng() + 1)
	);
	return 1/lngDistance;
}

var getTotalTime = function(startTimeString, endTimeString) 
{
	var regex = /^(\d|[1][0-2])(?::)?([0-5]\d)?\s?(AM|PM)$/i;
	var startParsed = regex.exec(startTimeString);
	console.log(startParsed);
	var startHour = startParsed[1];
	var startMinute = typeof startParsed[2] === 'undefined' ? 0 : startParsed[2];
	var startTime = parseInt(startHour) + (startMinute/60)

	// if ( /^P.?M.?$/i.test(startParsed[3]) ) 
	// 	endTime += 12;	

	var endParsed = regex.exec(endTimeString);
	var endHour = parseInt(endParsed[1]);
	var endMinute = typeof endParsed[2] === 'undefined' ? 0 : endParsed[2];
	var endTime = endHour + (endMinute/60);

	if ( /^P.?M.?$/i.test(endParsed[3]) && endHour != 12 ) 
		endTime += 12; 
	else if ( /^A.?M.?$/i.test(endParsed[3]) && endHour != 12 )
		endTime += 24;
	else if ( /^A.?M.?$/i.test(endParsed[3]) && endHour == 12 )
		endTime += 12;

	return endTime - startTime;
}

var incrementTimestamp = function(baseTimeString, timeDifference) {
	var regex = /^(\d|[1][0-2])(?::)?([0-5]\d)?\s?(AM|PM)$/i;

	var baseParsed = regex.exec(baseTimeString);
	var baseHour = parseInt(baseParsed[1]);
	var baseMinute = typeof baseParsed[2] === 'undefined' ? 0 : baseParsed[2];

	var newTime = new Date();

	newTime.setHours(parseInt(baseParsed[1]) + Math.floor(timeDifference));
	newTime.setMinutes(baseMinute + 60*(timeDifference - Math.floor(timeDifference)));

	var newHour = newTime.getHours();
	var period = newHour >= 12 ? ' pm' : ' am';

	var newHourString = String(newHour) % 12 == 0 ? 12 : String(newHour % 12);

	var newMinuteString = newTime.getMinutes() == 0 ? '' : ':' + String(padInteger(newTime.getMinutes(),2));

	var newTimeString = newHourString + newMinuteString + period;

	return newTimeString;
}

var timestringToInteger = function(timeString) {
	var regex = /^(\d|[1][0-2])(?::)?([0-5]\d)?\s?(AM|PM)$/i;
	var parsed = regex.exec(timeString);

	var hour = parseInt(parsed[1]) % 24;
	var minute = typeof parsed[2] === 'undefined' ? 0 : parseInt(parsed[2])/60;

	if ( /^P.?M.?$/i.test(parsed[3]) && hour != 12) 
		hour += 12; 
	if ( /^A.?M.?$/i.test(parsed[3]) && hour == 12 )
		hour = 0;

	return hour + minute;
}

function padInteger(num, length) {

    return (num / Math.pow(10, length)).toFixed(length).substr(2);
}

if(!Array.prototype.last) {
    Array.prototype.last = function() {
        return this[this.length - 1];
    }
}

function getCSSRule(ruleName, deleteFlag) {               // Return requested style obejct
   ruleName=ruleName.toLowerCase();                       // Convert test string to lower case.
   if (document.styleSheets) {                            // If browser can play with stylesheets
      for (var i=0; i<document.styleSheets.length; i++) { // For each stylesheet
         var styleSheet=document.styleSheets[i];          // Get the current Stylesheet
         var ii=0;                                        // Initialize subCounter.
         var cssRule=false;                               // Initialize cssRule. 
         do {                                             // For each rule in stylesheet
            if (styleSheet.cssRules) {                    // Browser uses cssRules?
               cssRule = styleSheet.cssRules[ii];         // Yes --Mozilla Style
            } else {                                      // Browser usses rules?
               cssRule = styleSheet.rules[ii];            // Yes IE style. 
            }                                             // End IE check.
            if (cssRule)  {                               // If we found a rule...
               if (cssRule.selectorText.toLowerCase()==ruleName) { //  match ruleName?
                  if (deleteFlag=='delete') {             // Yes.  Are we deleteing?
                     if (styleSheet.cssRules) {           // Yes, deleting...
                        styleSheet.deleteRule(ii);        // Delete rule, Moz Style
                     } else {                             // Still deleting.
                        styleSheet.removeRule(ii);        // Delete rule IE style.
                     }                                    // End IE check.
                     return true;                         // return true, class deleted.
                  } else {                                // found and not deleting.
                     return cssRule;                      // return the style object.
                  }                                       // End delete Check
               }                                          // End found rule name
            }                                             // end found cssRule
            ii++;                                         // Increment sub-counter
         } while (cssRule)                                // end While loop
      }                                                   // end For loop
   }                                                      // end styleSheet ability check
   return false;                                          // we found NOTHING!
}                                                         // end getCSSRule 
