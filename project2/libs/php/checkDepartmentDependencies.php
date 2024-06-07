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
	$query = $conn->prepare('SELECT id, name, locationID FROM department WHERE id =  ?');

	$query->bind_param("i", $_POST['id']);

	$query->execute();
	
	if (false === $query) {

		$output['status']['code'] = "400";
		$output['status']['name'] = "executed";
		$output['status']['description'] = "query failed";	
		$output['data'] = [];

		echo json_encode($output); 
	
		mysqli_close($conn);
		exit;

	}

	$result = $query->get_result();

   	$department = [];

	while ($departmentRow = mysqli_fetch_assoc($result)) {

		array_push($department, $departmentRow);

	}
if ($row['COUNT(*)'] > 0) {
    $output['hasDependencies'] = true;
    $output['dependencies'] = $row['COUNT(*)'];
    $output['data'] = $department;
} else {
    $output['hasDependencies'] = false;
}

mysqli_close($conn);

echo json_encode($output);

?>
