<?php
require_once './Mobile_Detect.php';
$detect = new Mobile_Detect;
$term = 'sched201608';
if(isset($_GET['term']) and $_GET['term'] !== '') {
	$term = $_GET['term'];
}
$debug = '1';
if(isset($_GET['debug']) and $_GET['debug'] !== '') {
	$debug = $_GET['debug'];
}
$version = '1.1.00';
if(isset($_GET['ver']) and $_GET['ver'] !== '') {
	$version = $_GET['ver'];
}
?>
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>GSW Schedule of Classes</title>
	<meta name="description" content="Interactive course schedule at Georgia Southwestern State Uiversity (GSW)">
	<meta name="robots" content="index,nofollow">
	<meta name="keywords" content="interactive schedule,interactive course schedule,GSW,Georgia Southwestern State Uiversity">
	<meta name="author" content="Simon Baev">
	<meta name="no-email-collection" content="http://www.metatags.info/nospamharvesting">
	<script>
		function getDeviceType() {
			return '<?php echo ($detect->isMobile() ? ($detect->isTablet() ? 'tablet' : 'phone') : 'computer');?>';
		}
		function isMobile() {
			return <?php echo ($detect->isMobile() ? 'true' : 'false');?>;
		}
		function getTerm(){
			return '<?php echo $term; ?>';
		}
		function getDebug(){
			return '<?php echo $debug; ?>';
		}
		function getVersion(){
			return '<?php echo $version; ?>';
		}
	</script>
	<?php
	if($detect->isMobile() and !($detect->isTablet())) {
		echo '<meta name="viewport" content="width=768, maximum-scale=1">';
	}
	?>
	<link rel="stylesheet" type="text/css" href="css/interactor.css" />
	<script type="text/javascript" src="https://code.jquery.com/jquery-1.11.0.js"></script>
	<script type="text/javascript" src="js/jquery-timing.min.js"></script>
	<script type="text/javascript" src="js/xxhash.min.lmd.js"></script>
	<script type="text/javascript" src="js/buildings.js"></script>
	<script type="text/javascript" src="js/interactor.js"></script>
	<script src="//fast.eager.io/KozO437RIl.js"></script>

</head>
<body>
	<a id='topOfThePage' href name='#'></a>
	<div id='glass'></div>
</body>
</html>
