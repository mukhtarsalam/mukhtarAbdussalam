<?php
include_once('apiKeys.php');
	$executionStartTime = microtime(true);
$url = "https://en.wikipedia.org/w/api.php?action=opensearch&limit=1&format=json&search=".$_REQUEST['selectCountry'];
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
				$temp['link'] = $decode[3][0];
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