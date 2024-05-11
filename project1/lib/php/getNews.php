<?php
include_once('apiKeys.php');
	$executionStartTime = microtime(true);
$url = "https://newsdata.io/api/1/news?apikey=".$news."&country=".$_REQUEST['countryCode']."&size=10&language=en";
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
				// Create output array

		$articles = [];

		// Loop through objects

		foreach ($decode['results'] as $article) {

			// Create a temporary variable, add two properties to it
			// from current iteration and append it to the array

			$temp = null;
			$temp['title'] = $article['title'];
			$temp['icon'] = $article['image_url'];
            $temp['link'] = $article['link'];
            $temp['description'] = $article['description'];
            $temp['source'] = $article['source_id'];
            $temp['published'] = $article['pubDate'];

			array_push($articles, $temp);
    }
    $output['status']['code'] = "200";
		$output['status']['name'] = "ok";
		$output['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
		$output['data'] = $articles;

			}
		}
	}
		


	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>