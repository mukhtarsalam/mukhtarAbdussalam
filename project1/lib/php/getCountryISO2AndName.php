<?php
//Error reporting for browser
ini_set('display_errors', 'On');
	error_reporting(E_ALL);	
    // Set the return header

	header('Content-Type: application/json; charset=UTF-8');

    // start recording the time taken
    $executionStartTime = microtime(true);

    // Open the file and seralise it to an associative array by using the optional
	// json_decode parameter TRUE. Omitting this will create an object instead.

    
    $countryData = json_decode(file_get_contents('../js/countryBorders.geo.json'), true);

    //Testing that data is fetched
    if (is_null($countryData)) {

		$output['status']['code'] = "400";
		$output['status']['name'] = "failure";
		$output['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

	}else{
        // Create output array

		$country = [];

		// Loop through objects

		foreach ($countryData['features'] as $feature) {

			// Create a temporary variable, add two properties to it
			// from current iteration and append it to the array

			$temp = null;
			$temp['code'] = $feature['properties']['iso_a2'];
			$temp['name'] = $feature['properties']['name'];

			array_push($country, $temp);
    }
    // Perform custom sort on name property of each object

		usort($country, function ($item1, $item2) {

			return $item1['name'] <=> $item2['name'];

		});
        $output['status']['code'] = "200";
		$output['status']['name'] = "ok";
		$output['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
		$output['data'] = $country;
}

    echo json_encode($output);

?>