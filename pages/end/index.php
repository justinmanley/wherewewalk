<html class="thankyou">
<link href='http://fonts.googleapis.com/css?family=Andada' rel='stylesheet' type='text/css'>
<link rel="stylesheet" type="text/css" href="../../dowsing-js/css/style.css">
<script>
	setTimeout("location.href = 'http://facilities.uchicago.edu/about/mission/';", 5000)
</script>
<?php 

function successful_database_save() {
	echo '<div id="thankyou">Thank you for your input.<br />Your response will help us improve campus.</div>\n';		
	return;
}

require_once('../../dowsing-js/save.php'); 

?>
</html><!-- .thankyou -->