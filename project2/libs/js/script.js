function preloader() {
  if ($("#preloader").length) {
    $("#preloader")
      .delay(1000)
      .fadeOut("slow", function () {
        $(this).remove();
      });
  }
}
$("#searchInp").on("keyup", function () {
  // your code
  var searchTerm = $("#searchInp").val().trim();
  if (searchTerm !== "") {
    search(searchTerm);
  } else {
    // If search term is empty, display all personnel
    getAll();
  }
});
$("#refreshBtn").click(function () {
  if ($("#personnelBtn").hasClass("active")) {
    // Refresh personnel table
    getAll();
  } else {
    if ($("#departmentsBtn").hasClass("active")) {
      // Refresh department table
      getAllDepartments();
    } else {
      // Refresh location table
      getAllLocation();
    }
  }
});

$("#filterBtn").click(function () {
  $("#filterEmployeesModal").modal("show");
});
var departmentContainer = $("#departmentContainer");
var selectedDepartments = []; // Array to hold the selected departmentss

departmentContainer.on("click", ".department-item", function () {
  var departmentId = $(this).data("id");

  // Toggle selection
  if ($(this).hasClass("btn-outline-secondary")) {
    $(this).removeClass("btn-outline-secondary").addClass("btn-secondary");
    selectedDepartments.push(departmentId);
  } else {
    $(this).addClass("btn-outline-secondary").removeClass("btn-secondary");
    var index = selectedDepartments.indexOf(departmentId);
    if (index > -1) {
      selectedDepartments.splice(index, 1);
    }
  }
});
$("#filter").click(function () {
  if (selectedDepartments.length === 0) {
    getAll();
  } else {
    displayPersonnelByDepartments(selectedDepartments);
  }
  $("#filterEmployeesModal").modal("hide");
});

$("#addBtn").click(function () {
  // toggle modal based on the active tab
  if ($("#personnelBtn").hasClass("active")) {
    $("#addPersonnelModal").modal("toggle");
  } else {
    if ($("#departmentsBtn").hasClass("active")) {
      $("#addDepartmentModal").modal("toggle");
    } else {
      $("#addLocationModal").modal("toggle");
    }
  }
});

$("#personnelBtn").click(function () {
  // Call function to refresh personnel table
  getAll();
});

$("#departmentsBtn").click(function () {
  // Call function to refresh department table
  getAllDepartments();
});

$("#locationsBtn").click(function () {
  // Call function to refresh location
  getAllLocation();
});

$("#editPersonnelModal").on("show.bs.modal", function (e) {
  $.ajax({
    url: "libs/php/getPersonnelByID.php",
    type: "POST",
    dataType: "json",
    data: {
      // Retrieve the data-id attribute from the calling button
      // see https://getbootstrap.com/docs/5.0/components/modal/#varying-modal-content
      // for the non-jQuery JavaScript alternative
      id: $(e.relatedTarget).attr("data-id"),
    },
    success: function (result) {
      var resultCode = result.status.code;

      if (resultCode == 200) {
        // Update the hidden input with the employee id so that
        // it can be referenced when the form is submitted

        $("#editPersonnelID").val(result.data.personnel[0].id);

        $("#editPersonnelFirstName").val(result.data.personnel[0].firstName);
        $("#editPersonnelLastName").val(result.data.personnel[0].lastName);
        $("#editPersonnelJobTitle").val(result.data.personnel[0].jobTitle);
        $("#editPersonnelEmailAddress").val(result.data.personnel[0].email);

        $("#editPersonnelDepartment").html("");

        $.each(result.data.department, function () {
          $("#editPersonnelDepartment").append(
            $("<option>", {
              value: this.id,
              text: this.name,
            })
          );
        });

        $("#editPersonnelDepartment").val(
          result.data.personnel[0].departmentID
        );
      } else {
        $("#editPersonnelModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $("#editPersonnelModal .modal-title").replaceWith(
        "Error retrieving data"
      );
    },
  });
});
$("#editDepartmentModal").on("show.bs.modal", function (e) {
  $.ajax({
    url: "libs/php/getDepartmentByID.php",
    type: "POST",
    dataType: "json",
    data: {
      // Retrieve the data-id attribute from the calling button
      // see https://getbootstrap.com/docs/5.0/components/modal/#varying-modal-content
      // for the non-jQuery JavaScript alternative
      id: $(e.relatedTarget).attr("data-id"),
    },
    success: function (result) {
      var resultCode = result.status.code;
      if (resultCode == 200) {
        $("#editDepartmentName").val(result.data.department[0].name);
        // Update the hidden input with the department id so that
        // it can be referenced when the form is submitted
        $("#editDepartmentID").val(result.data.department[0].id);
        $("#editDepartmentLocation").html("");
        $.each(result.data.location, function () {
          $("#editDepartmentLocation").append(
            $("<option>", {
              value: this.id,
              text: this.name,
            })
          );
        });
        $("#editDepartmentLocation").val(result.data.department[0].locationID);
      } else {
        $("#editDepartmentModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $("#editDepartmentModal .modal-title").replaceWith(
        "Error retrieving data"
      );
    },
  });
});
$("#editLocationModal").on("show.bs.modal", function (e) {
  $.ajax({
    url: "libs/php/getLocationByID.php",
    type: "POST",
    dataType: "json",
    data: {
      // Retrieve the data-id attribute from the calling button
      // see https://getbootstrap.com/docs/5.0/components/modal/#varying-modal-content
      // for the non-jQuery JavaScript alternative
      id: $(e.relatedTarget).attr("data-id"),
    },
    success: function (result) {
      var resultCode = result.status.code;
      if (resultCode == 200) {
        $("#editLocationName").val(result.data[0].name);
        // Update the hidden input with the location id so that
        // it can be referenced when the form is submitted
        $("#editLocationID").val(result.data[0].id);
      } else {
        $("#editLocationModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $("#editLocationModal .modal-title").replaceWith("Error retrieving data");
    },
  });
});
// Executes when the form button with type="submit" is clicked

// Adding new data
$("#addDepartmentForm").on("submit", function (e) {
  // Executes when the form button with type="submit" is clicked
  // stop the default browser behviour
  e.preventDefault();
  var departmentName = $("#departmentName").val();
  var locationID = $("#departmentLocation").val();
  $.ajax({
    url: "libs/php/insertDepartment.php",
    method: "POST",
    data: {
      name: departmentName,
      locationID: locationID,
    },
    dataType: "json",
    success: function (response) {
      if (response.status.code === "200") {
        $("#addDepartmentModal").modal("toggle");
        confirmChangeString("Department added");
        getAllDepartments(); // Load departments when the page is ready
      } else {
        alert("Error: " + response.status.description);
      }
    },
    error: function (error) {
      alert("There was an error processing your request.");
    },
  });
});
$("#addLocationForm").on("submit", function (e) {
  // Executes when the form button with type="submit" is clicked
  // stop the default browser behviour
  e.preventDefault();
  var locationName = $("#locationName").val();
  $.ajax({
    url: "libs/php/insertLocation.php",
    method: "POST",
    data: {
      name: locationName,
    },
    dataType: "json",
    success: function (response) {
      if (response.status.code === "200") {
        $("#addLocationModal").modal("toggle");
        $("#locationName").val("");

        confirmChangeString("Location added");
        getAllLocation(); // Load locations when the page is ready
      } else {
        alert("Error: " + response.status.description);
      }
    },
    error: function (error) {
      console.log(error);
      alert("There was an error adding new location.");
    },
  });
});
$("#addPersonnelForm").on("submit", function (e) {
  // Executes when the form button with type="submit" is clicked
  // stop the default browser behviour
  e.preventDefault();
  var firstName = $("#personnelFirstName").val();
  var lastName = $("#personnelLastName").val();
  var jobTitle = $("#personnelJobTitle").val();
  var email = $("#personnelEmail").val();
  var departmentID = $("#personnelDepartment").val();
  $.ajax({
    url: "libs/php/insertPersonnel.php",
    method: "POST",
    data: {
      firstName: firstName,
      lastName: lastName,
      jobTitle: jobTitle,
      email: email,
      departmentID: departmentID,
    },
    dataType: "json",
    success: function (response) {
      if (response.status.code === "200") {
        $("#addPersonnelModal").modal("toggle");
        confirmChangeString("Pesronnel added");
        getAll(); // Load personnel when the page is ready
      } else {
        alert("Error: " + response.status.description);
      }
    },
    error: function (error) {
      alert("There was an error adding new personnel.");
    },
  });
});

// Updating data
$("#editPersonnelForm").on("submit", function (e) {
  // Executes when the form button with type="submit" is clicked
  // stop the default browser behviour

  e.preventDefault();

  let formData = {
    id: $("#editPersonnelID").val(),
    firstName: $("#editPersonnelFirstName").val(),
    lastName: $("#editPersonnelLastName").val(),
    jobTitle: $("#editPersonnelJobTitle").val(),
    email: $("#editPersonnelEmailAddress").val(),
    departmentID: $("#editPersonnelDepartment").val(),
  };

  $.ajax({
    url: "libs/php/editPersonnel.php",
    type: "POST",
    data: formData,
    dataType: "json",
    success: function (response) {
      console.log(response.status.code);
      if (response.status.code === "200") {
        $("#editPersonnelModal").toggle();
        confirmChangeString("Person edited");
        getAll();
      } else {
        alert("Update failed: " + response.status.description);
      }
    },
    error: function (error) {
      alert("An error occurred: " + error.statusText);
    },
  });
});
$("#editDepartmentForm").on("submit", function (e) {
  e.preventDefault();

  let formData = {
    id: $("#editDepartmentID").val(),
    name: $("#editDepartmentName").val(),
    locationID: $("#editDepartmentLocation").val(),
  };

  $.ajax({
    url: "libs/php/editDepartment.php",
    type: "POST",
    data: formData,
    dataType: "json",
    success: function (response) {
      if (response.status.code === "200") {
        $("#editDepartmentModal").toggle();
        confirmChangeString("Department edited");
        getAllDepartments();
      } else {
        alert("Update failed: " + response.status.description);
      }
    },
    error: function (error) {
      console.log(error);
      alert("An error occurred: " + error.statusText);
    },
  });
});
$("#editLocationForm").on("submit", function (e) {
  e.preventDefault(); // prevent default form submission

  let formData = {
    id: $("#editLocationID").val(),
    locationName: $("#editLocationName").val(),
  };

  $.ajax({
    url: "libs/php/editLocation.php",
    type: "POST",
    data: formData,
    dataType: "json",
    success: function (response) {
      if (response.status.code === "200") {
        $("#editLocationModal").toggle();
        confirmChangeString("Location edited");
        getAllLocation();
      } else {
        alert("Update failed: " + response.status.description);
      }
    },
    error: function (error) {
      alert("An error occurred: " + error.statusText);
    },
  });
});
$(document).ready(function () {
  getAll();
  getAllDepartments();
  getAllLocation();
  preloader();
});

// Deleting data
// Personnel Delete Button
$(document).on("click", ".deletePersonnelBtn", function () {
  var personnelID = $(this).data("id");

  confirmDeleteModalControl("personnel", personnelID, deletePersonnel);
});

function deletePersonnel(id) {
  $.ajax({
    url: "libs/php/deletePersonnel.php",
    type: "POST",
    data: {
      id: id,
    },
    dataType: "json",
    success: function (response) {
      if (response.status.code == "200") {
        $('#personnel-tab-pane tbody tr[data-id="' + id + '"]').remove();

        confirmChangeString("Person deleted");
        getAll();
      } else {
        alert("Error deleting person: " + response.status.description);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      alert("An error occurred: " + textStatus);
    },
  });
}
// Department Delete Button
$(document).on("click", ".deleteDepartmentBtn", function () {
  getAllDepartments();
  var departmentID = $(this).data("id");

  $.ajax({
    url: "libs/php/checkDepartmentDependencies.php",
    type: "POST",
    data: { id: departmentID },
    dataType: "json",
    success: function (response) {
      if (response.hasDependencies) {
        notAllowedModalControl("department", departmentID, deleteDepartment);
      } else {
        confirmDeleteModalControl("department", departmentID, deleteDepartment);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      alert("An error occurred while checking dependencies: " + textStatus);
    },
  });
});

function deleteDepartment(id) {
  $.ajax({
    url: "libs/php/deleteDepartmentByID.php",
    type: "POST",
    data: { id: id },
    dataType: "json",
    success: function (response) {
      if (response.status.code == "200") {
        $('#department-tab-pane tbody tr[data-id="' + id + '"]').remove();
        confirmChangeString("Department deleted");
      } else {
        alert("Error deleting department: " + response.status.description);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      alert("An error occurred: " + textStatus);
    },
  });
}
// Location Delete Button
$(document).on("click", ".deleteLocationBtn", function () {
  var locationID = $(this).data("id");

  $.ajax({
    url: "libs/php/checkLocationDependencies.php",
    type: "POST",
    data: { id: locationID },
    dataType: "json",
    success: function (response) {
      if (response.hasDependencies) {
        notAllowedModalControl("location", locationID, deleteLocation);
      } else {
        confirmDeleteModalControl("location", locationID, deleteLocation);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      alert("An error occurred while checking dependencies: " + textStatus);
    },
  });
});

function deleteLocation(id) {
  $.ajax({
    url: "libs/php/deleteLocationByID.php",
    type: "POST",
    data: {
      id: id,
    },
    dataType: "json",
    success: function (response) {
      if (response.status.code == "200") {
        $('#location-tab-pane tbody tr[data-id="' + id + '"]').remove();

        confirmChangeString("Location deleted");
        getAllLocation();
      } else {
        alert("Error deleting location: " + response.status.description);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      alert("An error occurred: " + textStatus);
    },
  });
}
// Function to return all personell data in frontend
function getAll() {
  $.ajax({
    url: "libs/php/getAll.php",
    type: "POST",
    dataType: "json",
    data: {},
    success: function (result) {
      var resultCode = result.status.code;

      if (resultCode == 200) {
        // Update the hidden input with the employee id so that
        // it can be referenced when the form is submitted
        $("#personnelTableBody").empty();

        var resultData = result.data;
        for (let i = 0; i < resultData.length; i++) {
          $("#personnelTableBody").append(
            $(`<tr data-department-id="${resultData[i].departmentID}">
                <td class="align-middle text-nowrap" id="personnelFullName">${resultData[i].firstName}, ${resultData[i].lastName}</td>
                <td class="align-middle text-nowrap d-none d-md-table-cell">
                  ${resultData[i].department}
                </td>
                <td class="align-middle text-nowrap d-none d-md-table-cell">
                  ${resultData[i].location}
                </td>
                <td class="align-middle text-nowrap d-none d-md-table-cell">
                  ${resultData[i].email}
                </td>
                <td class="text-end text-nowrap">
                  <button
                    type="button"
                    class="btn btn-primary btn-sm"
                    data-bs-toggle="modal"
                    data-bs-target="#editPersonnelModal"
                    data-id="${resultData[i].id}"
                  >
                    <i class="fa-solid fa-pencil fa-fw"></i>
                  </button>
                  <button
                    type="button"
                    class="btn btn-primary btn-sm deletePersonnelBtn"
                    data-id="${resultData[i].id}"
                  >
                    <i class="fa-solid fa-trash fa-fw"></i>
                  </button>
                </td>
              </tr>`)
          );
        }
      } else {
        $("#editPersonnelModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $("#editPersonnelModal .modal-title").replaceWith(
        "Error retrieving data"
      );
    },
  });
}

// Get all departments from database and display in frontend
function getAllDepartments() {
  $.ajax({
    url: "libs/php/getAllDepartments.php",
    type: "POST",
    dataType: "json",
    data: {},
    success: function (result) {
      var resultData = result.data;
      var departmentContainer = $("#departmentContainer");

      if (result.status.code == 200) {
        departmentContainer.empty();
        $("#departmentTableBody").empty();
        for (let i = 0; i < resultData.length; i++) {
          var departmentItem = $(
            '<button class="btn btn-outline-secondary m-2 department-item" data-id="' +
              resultData[i].id +
              '">' +
              resultData[i].name +
              "</button>"
          );
          departmentContainer.append(departmentItem);
          $("#personnelDepartment").append(
            $("<option>", {
              value: resultData[i].id,
              text: resultData[i].name,
            })
          );
          $("#departmentTableBody").append(`
        <tr>
                <td class="align-middle text-nowrap">${resultData[i].name}</td>
                <td class="align-middle text-nowrap d-none d-md-table-cell">
                  ${resultData[i].locationName}
                </td>
                <td class="align-middle text-end text-nowrap">
                  <button
                    type="button"
                    class="btn btn-primary btn-sm"
                    data-bs-toggle="modal"
                    data-bs-target="#editDepartmentModal"
                    data-id="${resultData[i].id}"
                  >
                    <i class="fa-solid fa-pencil fa-fw"></i>
                  </button>
                  <button
                    type="button"
                    class="btn btn-primary btn-sm deleteDepartmentBtn"
                    data-id="${resultData[i].id}"
                  >
                    <i class="fa-solid fa-trash fa-fw"></i>
                  </button>
                </td>
              </tr>`);
        }
      }
    },
  });
}
function getAllLocation() {
  $.ajax({
    url: "libs/php/getAllLocation.php",
    type: "POST",
    dataType: "json",
    data: {},
    success: function (result) {
      var resultCode = result.status.code;
      var resultData = result.data;
      if (resultCode == 200) {
        $("#locationTableBody").empty();
        for (let i = 0; i < resultData.length; i++) {
          $("#departmentLocation").append(
            $("<option>", {
              value: resultData[i].id,
              text: resultData[i].name,
            })
          );
          $("#locationTableBody").append(`<tr>
                <td class="align-middle text-nowrap">${resultData[i].name}</td>
                <td class="align-middle text-end text-nowrap">
                  <button
                    type="button"
                    class="btn btn-primary btn-sm"
                    data-bs-toggle="modal"
                    data-bs-target="#editLocationModal"
                    data-id="${resultData[i].id}"
                  >
                    <i class="fa-solid fa-pencil fa-fw"></i>
                  </button>
                  <button
                    type="button"
                    class="btn btn-primary btn-sm deleteLocationBtn"
                    data-id="${resultData[i].id}"
                  >
                    <i class="fa-solid fa-trash fa-fw"></i>
                  </button>
                </td>
              </tr>
        `);
        }
      }
    },
  });
}
// Changing the confirm message depending on the function
function confirmChangeString(string) {
  $("#confirmChangesElement").html(string);
  $("#confirmChangesModal").modal("show");
}
function notAllowedModalControl(string, elementID, callback) {
  // Deletion confirm function
  // Modal to confirm deletion
  $("#notAllowedMessageMessage").html(string);
  $("#notAllowedMessageModal").modal("show");

  $("#deleteElementBtn")
    .off("click")
    .click(function () {
      callback(elementID);

      $("#alertMessageModal").modal("hide");
      $(".modal-backdrop").remove();
    });
}
function confirmDeleteModalControl(string, elementID, callback) {
  // Deletion confirm function
  // Modal to confirm deletion
  $("#deleteElementMessage").html(string);
  $("#alertModal").modal("show");

  $("#deleteElementBtn")
    .off("click")
    .click(function () {
      callback(elementID);

      $("#alertModal").modal("hide");
      $(".modal-backdrop").remove();
    });
}
function displayPersonnelByDepartments(departmentIds) {
  var allTableRow = $("#personnelTableBody > tr");
  allTableRow.hide(); // hiding all table rows
  var personnelFullName = $("#personnelFullName");

  // If no departments are selected, show all table rows
  if (departmentIds.length === 0) {
    allTableRow.show();
    return;
  }

  // Only show table rows that match the selected departments
  departmentIds.forEach(function (id) {
    var matchingTableRow = $(
      "#personnelTableBody > tr[data-department-id=" + id + "]"
    );
    matchingTableRow.show();

    allTableRow.find(".collapse").collapse("show");
  });
}

function search(searchTerm) {
  $.ajax({
    type: "GET",
    url: "libs/php/searchAll.php",
    data: { txt: searchTerm },
    dataType: "json",
    success: function (result) {
      if (result.status.code === "200") {
        if (result.data.found.length < 1) {
          $("#personnelTableBody").empty();
          $("#personnelTableBody").append(
            $(`<tr>
               <td>No user found</td>
              </tr>`)
          );
        } else {
          $("#personnelTableBody").empty();
          var resultData = result.data.found;
          console.log(resultData);
          for (let i = 0; i < resultData.length; i++) {
            $("#personnelTableBody").append(
              $(`<tr data-department-id="${resultData[i].departmentID}">
                <td class="align-middle text-nowrap" id="personnelFullName">${resultData[i].firstName}, ${resultData[i].lastName}</td>
                <td class="align-middle text-nowrap d-none d-md-table-cell">
                  ${resultData[i].departmentName}
                </td>
                <td class="align-middle text-nowrap d-none d-md-table-cell">
                  ${resultData[i].locationName}
                </td>
                <td class="align-middle text-nowrap d-none d-md-table-cell">
                  ${resultData[i].email}
                </td>
                <td class="text-end text-nowrap">
                  <button
                    type="button"
                    class="btn btn-primary btn-sm"
                    data-bs-toggle="modal"
                    data-bs-target="#editPersonnelModal"
                    data-id="${resultData[i].id}"
                  >
                    <i class="fa-solid fa-pencil fa-fw"></i>
                  </button>
                  <button
                    type="button"
                    class="btn btn-primary btn-sm deletePersonnelBtn"
                    data-id="${resultData[i].id}"
                  >
                    <i class="fa-solid fa-trash fa-fw"></i>
                  </button>
                </td>
              </tr>`)
            );
          }
        }
      }
    },
    error: function () {
      $("#noUser").removeClass("d-none");
    },
  });
}
