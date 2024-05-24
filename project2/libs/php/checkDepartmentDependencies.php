<?php

header('Content-Type: application/json; charset=UTF-8');
$executionStartTime = microtime(true);

include("config.php");



// Checking if the Department has dependencies
$checkDependenciesQuery = $conn->prepare('SELECT COUNT(*) FROM personnel WHERE departmentID = ?');
$checkDependenciesQuery->bind_param("i", $_REQUEST['id']);
$success = $checkDependenciesQuery->execute();

if(!$success) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "executed";
    $output['status']['description'] = "error checking dependencies";
    $output['data'] = [];

    mysqli_close($conn);
    echo json_encode($output);
    exit;
}

$result = $checkDependenciesQuery->get_result();
$row = $result->fetch_assoc();

if ($row['COUNT(*)'] > 0) {
    $output['hasDependencies'] = true;
} else {
    $output['hasDependencies'] = false;
}

mysqli_close($conn);

echo json_encode($output);

?>
