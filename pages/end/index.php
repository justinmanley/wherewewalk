<html class="thankyou">
<link rel="stylesheet" type="text/css" href="../../dowsing-js/css/style.css">
<link rel="stylesheet" type="text/css" href="../../css/style.css">
<script type="text/javascript" src="../../dowsing-js/resources/prefixfree.min.js"></script>
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
<div id="github-link">
	Think this survey is cool?   Check out the code on <a href="https://github.com/manleyjster/dowsing-js">Github</a>
</div>
</html><!-- .thankyou -->