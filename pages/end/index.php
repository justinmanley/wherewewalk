<html class="thankyou">
	<head>
		<link href='http://fonts.googleapis.com/css?family=Andada' rel='stylesheet' type='text/css'>
		<link rel="stylesheet" type="text/css" href="../../dowsing-js/css/style.css">
		<link rel="stylesheet" type="text/css" href="../../css/style.css">		
	<script>
		setTimeout("location.href = 'https://docs.google.com/forms/d/1kE8-US_KFWU3qdrmZQCu_b-zZ3ki4FXFXuSBtkvl2-0/viewform';", 7000)
	</script>
	</head>
	<body>
	<?php 
		function successful_database_save() {
			echo '<div id="thankyou">';
			echo '<p>Thanks for taking the survey.  In the real survey, this is the end.  From here, we redirect participants to the Facilities Services page.</p>';
			echo '<a href="https://facilities.uchicago.edu/about/mission/" target="_blank"><img class="webpage-excerpt" src="../../images/facilities_services_mission.png"></img></a>';
			echo '<p class="bright-background">But the survey\'s not quite over yet for you!  We\'re going to ask a few questions about the survey itself now to help us with usability testing.  Your browser will redirect you in a few seconds, or you can click <a href="https://docs.google.com/forms/d/1kE8-US_KFWU3qdrmZQCu_b-zZ3ki4FXFXuSBtkvl2-0/viewform">here</a>.</p>';
			echo '</div>';
		}

		require_once('../../dowsing-js/save.php'); 
	?>
	</body>
</html><!-- .thankyou -->