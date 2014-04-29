<html class="thankyou">
<head>
	<meta charset="UTF-8"/>
	<link href='http://fonts.googleapis.com/css?family=Andada' rel='stylesheet' type='text/css'/>
	<link rel="stylesheet" type="text/css" href="../../spatialsurvey/css/style.css"/>
	<link rel="stylesheet" type="text/css" href="../../css/style.css"/>
	<script>
		setTimeout("location.href = 'http://facilities.uchicago.edu/about/mission/';", 5000)
	</script>
</head>
<body>
<?php 

function successful_database_save() {
	echo '<div id="thankyou">Thank you for your input.<br />Your response will help us improve campus.</div>\n';		
	return;
}

require_once('../../spatialsurvey/save.php'); 

?>
<div id="github-link">
	Think this survey is cool?   Check out the code on <a href="https://github.com/manleyjster/spatialsurvey">Github</a>
</div>
</body>
</html><!-- .thankyou -->