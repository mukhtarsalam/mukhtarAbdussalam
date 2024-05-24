<?php

header('Content-Type: application/json; charset=UTF-8');
$executionStartTime = microtime(true);

include("config.php");

// Grabbing the data sent from AJAX
$personnelId = $_POST['id'];
$firstName = $_POST['firstName'];
$lastName = $_POST['lastName'];
$jobTitle = $_POST['jobTitle'];
$email = $_POST['email'];
$departmentID = $_POST['departmentID'];

$query = $conn->prepare('UPDATE personnel SET firstName = ?, lastName = ?, jobTitle = ?, email = ?, departmentID = ? WHERE id = ?');

$query->bind_param("ssssii", $firstName, $lastName, $jobTitle, $email, $departmentID, $personnelId);

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