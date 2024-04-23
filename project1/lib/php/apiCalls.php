<?php
include_once('apiKeys.php');
$executionStartTime = microtime(true) / 1000;
$restCountryUrl = "https://restcountries.com/v3.1/name/".$_REQUEST['restName']."?fullText=true";
$openExchangeUrl = "https://openexchangerates.org/api/latest.json?app_id=".$openExchangeKey;
$wikipediaUrl = "http://api.geonames.org/wikipediaSearchJSON?q=".$_REQUEST['restName']  ."&title=".$_REQUEST['restName']."&maxRows=1&username=".$geonameUser;
$openWeatherUrl ="https://api.openweathermap.org/data/3.0/onecall?lat=".$_REQUEST['latitude']  ."&lon=".$_REQUEST['longitude']."&exclude=hourly,minutely&units=metric&appid=".$openweatherKey;
$apiNinjasurl='https://api.api-ninjas.com/v1/airports?country='. $_REQUEST['iso'].'&X-Api-Key='.$appNinjaKey;
$apiNinjacitysurl='https://api.api-ninjas.com/v1/city?country='. $_REQUEST['iso'].'&X-Api-Key='.$appNinjaKey.'&limit=30';

// Build the individual requests, but do not execute them
$ch1 = curl_init($restCountryUrl);
$ch2 = curl_init($openExchangeUrl);
$ch3 = curl_init($wikipediaUrl);
$ch4 = curl_init($openWeatherUrl);
$ch5 = curl_init($apiNinjasurl);
$ch6 = curl_init($apiNinjacitysurl);
curl_setopt($ch1, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch3, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch4, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch5, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch6, CURLOPT_RETURNTRANSFER, true);

//create the multiple cURL handle adding both $ch
$mh = curl_multi_init();

//add the  handles
curl_multi_add_handle($mh, $ch1);
curl_multi_add_handle($mh, $ch2);
curl_multi_add_handle($mh, $ch3);
curl_multi_add_handle($mh, $ch4);
curl_multi_add_handle($mh, $ch5);
curl_multi_add_handle($mh, $ch6);
//execute the multi handle
$running = null;
do {
    curl_multi_exec($mh, $running);
    
} while ($running);

//close the handles
curl_multi_remove_handle($mh, $ch1);
curl_multi_remove_handle($mh, $ch2);
curl_multi_remove_handle($mh, $ch3);
curl_multi_remove_handle($mh, $ch4);
curl_multi_remove_handle($mh, $ch5);
curl_multi_remove_handle($mh, $ch6);
curl_multi_close($mh);

// all of our requests are done, we can now access the results
$restCountries = curl_multi_getcontent($ch1);
$openExchange = curl_multi_getcontent($ch2);
$geoNames = curl_multi_getcontent($ch3);
$openWeather = curl_multi_getcontent($ch4);
$apiNinja = curl_multi_getcontent($ch5);
$apiNinjaCity = curl_multi_getcontent($ch6);
/// Final Output
$output['status']['code'] = "200";
$output['status']['name'] = "OK";
$output['restCountries'] = json_decode($restCountries, true);
$output['openExchange'] = json_decode($openExchange, true);
$output['geoNames'] = json_decode($geoNames, true);
$output['openWeather'] = json_decode($openWeather, true);
$output['apiNinja'] = json_decode($apiNinja, true);
$output['apiNinjaCity'] = json_decode($apiNinjaCity, true);
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000000 . " ms";

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);
?>