function initialize() {
	spatialsurvey.init({
		appName: 'wherewewalk'
	});
	var surveyResponse = new spatialsurvey.SurveyResponse();
	surveyResponse.submit();
	setTimeout("location.href = 'http://facilities.uchicago.edu/about/mission/';", 5000);	
}
google.maps.event.addDomListener(window, 'load', initialize);