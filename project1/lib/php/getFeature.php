<?php
//Error reporting for browser
ini_set('display_errors', 'On');
	error_reporting(E_ALL);	
    // Set the return header

	header('Content-Type: application/json; charset=UTF-8');

    // start recording the time taken
    $executionStartTime = microtime(true);

    /* ================================================== */
    /* GET COUNTRY BORDER */
    /* ================================================== */
    /* Filters the selected country ISO2 code and returns */
    /* that country's Feature from the FeatureCollection */
    /* ================================================== */

     $iso2 = $_REQUEST['iso_2'];
    $countriesData = json_decode(file_get_contents('../js/countryBorders.geo.json'), true);

    //Testing that data is fetched
    if (is_null($countriesData)) {

		$output['status']['code'] = "400";
		$output['status']['name'] = "failure";
		$output['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

	}else{
		/* Filter the single country Feature that matches the ISO3 code */

		$countryFeature = array_filter($countriesData["features"], function ($country) use ($iso2) {
         return $country["properties"]["iso_a2"] == $iso2;
    });
	$output['status']['code'] = "200";
		$output['status']['name'] = "ok";
		$output['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    $output['data'] = array_values($countryFeature);
}
    echo json_encode($output);

?>