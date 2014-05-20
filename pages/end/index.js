function initialize() {
	spatialsurvey.init({
		appName: 'wherewewalk'
	});
	mapHelper.init({});
	var surveyResponse = new spatialsurvey.SurveyResponse();
	surveyResponse.submit();
}
google.maps.event.addDomListener(window, 'load', initialize);