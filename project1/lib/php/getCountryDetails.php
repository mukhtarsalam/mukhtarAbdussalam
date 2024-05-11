<?php
include_once('apiKeys.php');
	$executionStartTime = microtime(true);

    $url='https://restcountries.com/v3.1/name/'.$_REQUEST['selectCountry'].'?fullText=true';
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	$cURLERROR = curl_errno($ch);
	curl_close($ch);

	if($cURLERROR){
		$output['status']['code'] = $cURLERROR;
    $output['status']['name'] = "Failure - cURL";
    $output['status']['description'] = curl_strerror($cURLERROR);
		$output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
		$output['data'] = null;
	}else{
		$decode = json_decode($result,true);
		if(json_last_error() !== JSON_ERROR_NONE){
		 $output['status']['name'] = "Failure - JSON";
     	 $output['status']['description'] = json_last_error_msg();
	  	 $output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
		 $output['data'] = null;
		}else{
			if(isset($decode['error'])){
			 $output['status']['code'] = $decode['error']['code'];
        	 $output['status']['name'] = "Failure - API";
       		 $output['status']['description'] = $decode['error']['message'];
  	  		 $output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
	  	  	 $output['data'] = null;
			}else{
				// create array containing only the required properties
				$countryDetail = [];
                $temp = null;
				$temp['name'] = $decode[0]['name']['common'];
				$temp['officialName'] = $decode[0]['name']['official'];
                $temp['capital'] = $decode[0]['capital'][0];
                $temp['flag'] = $decode[0]['flags']['png'];
                $temp['population'] = $decode[0]['population'];
                $temp['continent'] = $decode[0]['continents'][0];
                $temp['area'] = $decode[0]['area'];
                $temp['currency'] = $decode[0]['currencies'];
                $temp['weekStarts'] = $decode[0]['startOfWeek'];
                $temp['languages'] = $decode[0]['languages'];
				$temp['latitude'] = $decode[0]['latlng'][0];
				$temp['longitude'] = $decode[0]['latlng'][1];
				array_push($countryDetail, $temp);
					$output['status']['code'] = "200";
					$output['status']['name'] = "ok";
					$output['status']['description'] = "success";
					$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
					$output['data'] = $countryDetail;	

			}
		}
	}
		


	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>