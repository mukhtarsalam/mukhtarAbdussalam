<?php

header('Content-Type: application/json; charset=UTF-8');
$executionStartTime = microtime(true);

include("config.php");

// Grabbing the data sent from AJAX
$departmentId = $_POST['id'];
$departmentName = $_POST['name'];
$departmentLocationID = $_POST['locationID'];

$query = $conn->prepare('UPDATE department SET name = ?, locationID = ? WHERE id = ?');

$query->bind_param("ssi", $departmentName, $departmentLocationID, $departmentId);

$query->execute();

if (!$query) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "executed";
    $output['status']['description'] = "query failed";
    $output['data'] = [];

    mysqli_close($conn);

    echo json_encode($output);
    exit;
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "update success";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = [];

mysqli_close($conn);

echo json_encode($output);
?>
