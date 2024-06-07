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
  $("#searchInp").val("");
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
$("#filterByDepartment").change(function () {
  if (this.value > 0) {
    $("#filterByLocation").val(0);
    var departmentID = $(this).val();
    // apply Filter
    filterPersonnelByDepartment(departmentID);
  }
});
$("#filterByLocation").change(function () {
  if (this.value > 0) {
    $("#filterByDepartment").val(0);
    var locationID = $(this).val();
    // apply Filter
    filterPersonnelByLocation(locationID);
  }
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
  $("#filterBtn").attr("disabled", false);
  // Call function to refresh personnel table
  getAll();
});

$("#departmentsBtn").click(function () {
  $("#filterBtn").attr("disabled", true);
  // Call function to refresh department table
  getAllDepartments();
});

$("#locationsBtn").click(function () {
  $("#filterBtn").attr("disabled", true);
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
$("#filterEmployeesModal").on("show.bs.modal", function (e) {
  $.ajax({
    url: "libs/php/getAllDepartments.php",
    type: "POST",
    dataType: "json",
    data: {},
    success: function (result) {
      var resultCode = result.status.code;
      if (resultCode == 200) {
        $("#filterByDepartment").empty();
        result.data.forEach(function (item, index) {
          $("#filterByDepartment").append(
            $("<option>", {
              value: item.id,
              text: item.name,
            })
          );
        });
      } else {
        $("#filterEmployeesModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $("#filterEmployeesModal .modal-title").replaceWith(
        "Error retrieving data"
      );
    },
  });
  $.ajax({
    url: "libs/php/getAllLocation.php",
    type: "POST",
    dataType: "json",
    data: {},
    success: function (result) {
      var resultCode = result.status.code;
      if (resultCode == 200) {
        $("#filterByLocation").empty();
        result.data.forEach(function (item, index) {
          $("#filterByLocation").append(
            $("<option>", {
              value: item.id,
              text: item.name,
            })
          );
        });
      } else {
        $("#filterEmployeesModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $("#filterEmployeesModal .modal-title").replaceWith(
        "Error retrieving data"
      );
    },
  });
});
// Executes when the form button with type="submit" is clicked

// Adding new data
$("#addDepartmentModal").on("submit", function (e) {
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
$("#addLocationModal").on("submit", function (e) {
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
      alert("There was an error adding new location.");
    },
  });
});
$("#addPersonnelModal").on("submit", function (e) {
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
$("#editPersonnelModal").on("submit", function (e) {
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
$("#editDepartmentModal").on("submit", function (e) {
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
      alert("An error occurred: " + error.statusText);
    },
  });
});
$("#editLocationModal ").on("submit", function (e) {
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
  $.ajax({
    url: "libs/php/getPersonnelByID.php",
    type: "POST",
    dataType: "json",
    data: {
      id: personnelID,
    },
    success: function (result) {
      var resultCode = result.status.code;

      if (resultCode == 200) {
        $("#removeTitle").empty();
        $("#removeTitle").append(`Remove employee entry`);
        var resultData = result.data.personnel[0];
        var fullName = `${resultData.firstName} ${resultData.lastName}`;
        confirmDeleteModalControl(fullName, personnelID, deletePersonnel);
      }
    },
  });
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
  var departmentID = $(this).data("id");

  $.ajax({
    url: "libs/php/checkDepartmentDependencies.php",
    type: "POST",
    data: { id: departmentID },
    dataType: "json",
    success: function (response) {
      if (response.hasDependencies) {
        $("#cannot").empty();
        $("#cannot").append(
          `<i class="fa-solid fa-ban"></i> Cannot remove department...`
        );
        var msg = `entry for <strong>${response.data[0].name}</strong> because it has <strong>${response.dependencies}</strong> dependencies`;
        notAllowedModalControl(msg, departmentID, deleteDepartment);
      } else {
        $.ajax({
          url: "libs/php/getDepartmentByID.php",
          type: "POST",
          dataType: "json",
          data: {
            id: departmentID,
          },
          success: function (result) {
            var resultCode = result.status.code;
            if (resultCode == 200) {
              $("#removeTitle").empty();
              $("#removeTitle").append(`Remove department entry`);
              var resultData = result.data.department[0];
              var department = resultData.name;
              confirmDeleteModalControl(
                department,
                departmentID,
                deleteDepartment
              );
            }
          },
        });
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
        getAllDepartments();
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
        $("#cannot").empty();
        $("#cannot").append(
          `<i class="fa-solid fa-ban"></i> Cannot remove location...`
        );
        var msg = `entry for <strong>${response.data[0].name}</strong> because it has <strong>${response.dependencies}</strong> dependencies`;
        notAllowedModalControl(msg, locationID, deleteLocation);
      } else {
        $.ajax({
          url: "libs/php/getLocationByID.php",
          type: "POST",
          dataType: "json",
          data: {
            id: locationID,
          },
          success: function (result) {
            var resultCode = result.status.code;
            if (resultCode == 200) {
              $("#removeTitle").empty();
              $("#removeTitle").append(`Remove location entry`);
              var resultData = result.data[0];
              var location = resultData.name;
              confirmDeleteModalControl(location, locationID, deleteLocation);
            }
          },
        });
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
        var personnelTableBody = document.getElementById("personnelTableBody");
        result.data.forEach(function (item, index) {
          var row = personnelTableBody.insertRow();

          var name = row.insertCell();
          name.classList = "align-middle text-nowrap";
          var firstName = document.createTextNode(item.firstName);
          var lastName = document.createTextNode(item.lastName);
          name.append(lastName);
          name.append(", ");
          name.append(firstName);
          var department = row.insertCell();
          department.classList =
            "align-middle text-nowrap d-none d-md-table-cell";
          var departmentText = document.createTextNode(item.department);
          department.append(departmentText);
          var location = row.insertCell();
          location.classList =
            "align-middle text-nowrap d-none d-md-table-cell";
          var locationText = document.createTextNode(item.location);
          location.append(locationText);
          var email = row.insertCell();
          email.classList = "align-middle text-nowrap d-none d-md-table-cell";
          var emailText = document.createTextNode(item.email);
          email.append(emailText);

          var actions = row.insertCell();
          actions.classList = "align-middle text-end text-nowrap";
          var editBtn = document.createElement("button");
          editBtn.setAttribute("data-bs-toggle", "modal");
          editBtn.setAttribute("data-bs-target", "#editPersonnelModal");
          editBtn.setAttribute("data-id", item.id);
          var editIcon = document.createElement("i");
          editIcon.classList = "fa-solid fa-pencil fa-fw ";
          editBtn.classList = "btn bg-primary text-light btn-sm";
          editBtn.appendChild(editIcon);

          var deleteBtn = document.createElement("button");
          deleteBtn.setAttribute("data-id", item.id);
          deleteBtn.classList =
            "btn bg-primary text-light deletePersonnelBtn btn-sm";
          var deleteIcon = document.createElement("i");
          deleteIcon.classList = "fa-solid fa-trash fa-fw ";
          deleteBtn.appendChild(deleteIcon);
          actions.append(editBtn);
          actions.append(" ");
          actions.append(deleteBtn);
        });
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
  $("#personnelDepartment").empty();
  $.ajax({
    url: "libs/php/getAllDepartments.php",
    type: "POST",
    dataType: "json",
    data: {},
    success: function (result) {
      if (result.status.code == 200) {
        $("#departmentTableBody").empty();
        var departmentTableBody = document.getElementById(
          "departmentTableBody"
        );
        result.data.forEach(function (item, index) {
          var row = departmentTableBody.insertRow();
          var departmentName = row.insertCell();
          departmentName.classList = "align-middle text-nowrap";
          var departmentNameText = document.createTextNode(item.name);
          departmentName.append(departmentNameText);
          var location = row.insertCell();
          location.classList =
            "align-middle text-nowrap d-none d-md-table-cell";
          var locationText = document.createTextNode(item.locationName);
          location.append(locationText);

          var actions = row.insertCell();
          actions.classList = "align-middle text-end text-nowrap";
          var editBtn = document.createElement("button");
          editBtn.setAttribute("data-bs-toggle", "modal");
          editBtn.setAttribute("data-bs-target", "#editDepartmentModal");
          editBtn.setAttribute("data-id", item.id);
          var editIcon = document.createElement("i");
          editIcon.classList = "fa-solid fa-pencil fa-fw ";
          editBtn.classList = "btn bg-primary text-light btn-sm";
          editBtn.appendChild(editIcon);

          var deleteBtn = document.createElement("button");
          deleteBtn.setAttribute("data-id", item.id);
          deleteBtn.classList =
            "btn bg-primary text-light deleteDepartmentBtn btn-sm";
          var deleteIcon = document.createElement("i");
          deleteIcon.classList = "fa-solid fa-trash fa-fw ";
          deleteBtn.appendChild(deleteIcon);
          actions.append(editBtn);
          actions.append(" ");
          actions.append(deleteBtn);
          $("#personnelDepartment").append(
            $("<option>", {
              value: item.id,
              text: item.name,
            })
          );
        });
      }
    },
  });
}
function getAllLocation() {
  $("#departmentLocation").empty();
  $.ajax({
    url: "libs/php/getAllLocation.php",
    type: "POST",
    dataType: "json",
    data: {},
    success: function (result) {
      var resultCode = result.status.code;

      if (resultCode == 200) {
        $("#locationTableBody").empty();
        var locationTableBody = document.getElementById("locationTableBody");
        result.data.forEach(function (item, index) {
          var row = locationTableBody.insertRow();
          var locationName = row.insertCell();
          locationName.classList = "align-middle text-nowrap";
          var locationNameText = document.createTextNode(item.name);
          locationName.append(locationNameText);

          var actions = row.insertCell();
          actions.classList = "align-middle text-end text-nowrap";
          var editBtn = document.createElement("button");
          editBtn.setAttribute("data-bs-toggle", "modal");
          editBtn.setAttribute("data-bs-target", "#editLocationModal");
          editBtn.setAttribute("data-id", item.id);
          var editIcon = document.createElement("i");
          editIcon.classList = "fa-solid fa-pencil fa-fw ";
          editBtn.classList = "btn bg-primary text-light btn-sm";
          editBtn.appendChild(editIcon);

          var deleteBtn = document.createElement("button");
          deleteBtn.setAttribute("data-id", item.id);
          deleteBtn.classList =
            "btn bg-primary text-light deleteLocationBtn btn-sm";
          var deleteIcon = document.createElement("i");
          deleteIcon.classList = "fa-solid fa-trash fa-fw ";
          deleteBtn.appendChild(deleteIcon);
          actions.append(editBtn);
          actions.append(" ");
          actions.append(deleteBtn);
          $("#departmentLocation").append(
            $("<option>", {
              value: item.id,
              text: item.name,
            })
          );
        });
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
function search(searchTerm) {
  $.ajax({
    type: "GET",
    url: "libs/php/searchAll.php",
    data: { txt: searchTerm },
    dataType: "json",
    success: function (result) {
      if (result.status.code === "200") {
        var personnelTableBody = document.getElementById("personnelTableBody");

        if (result.data.found.length < 1) {
          $("#personnelTableBody").empty();
          var row = personnelTableBody.insertRow();
          var noUser = row.insertCell();
          noUser.classList = "align-middle text-nowrap";
          var noUserText = document.createTextNode(
            `No personnel found for the search term ${searchTerm}`
          );
          noUser.append(noUserText);
        } else {
          $("#personnelTableBody").empty();
          result.data.found.forEach(function (item, index) {
            var row = personnelTableBody.insertRow();
            var name = row.insertCell();
            name.classList = "align-middle text-nowrap";
            var firstName = document.createTextNode(item.firstName);
            var lastName = document.createTextNode(item.lastName);
            name.append(lastName);
            name.append(", ");
            name.append(firstName);
            var department = row.insertCell();
            department.classList =
              "align-middle text-nowrap d-none d-md-table-cell";
            var departmentText = document.createTextNode(item.departmentName);
            department.append(departmentText);
            var location = row.insertCell();
            location.classList =
              "align-middle text-nowrap d-none d-md-table-cell";
            var locationText = document.createTextNode(item.locationName);
            location.append(locationText);
            var email = row.insertCell();
            email.classList = "align-middle text-nowrap d-none d-md-table-cell";
            var emailText = document.createTextNode(item.email);
            email.append(emailText);

            var actions = row.insertCell();
            actions.classList = "align-middle text-end text-nowrap";
            var editBtn = document.createElement("button");
            editBtn.setAttribute("data-bs-toggle", "modal");
            editBtn.setAttribute("data-bs-target", "#editPersonnelModal");
            editBtn.setAttribute("data-id", item.id);
            var editIcon = document.createElement("i");
            editIcon.classList = "fa-solid fa-pencil fa-fw ";
            editBtn.classList = "btn bg-primary text-light btn-sm";
            editBtn.appendChild(editIcon);

            var deleteBtn = document.createElement("button");
            deleteBtn.setAttribute("data-id", item.id);
            deleteBtn.classList =
              "btn bg-primary text-light deletePersonnelBtn btn-sm";
            var deleteIcon = document.createElement("i");
            deleteIcon.classList = "fa-solid fa-trash fa-fw ";
            deleteBtn.appendChild(deleteIcon);
            actions.append(editBtn);
            actions.append(" ");
            actions.append(deleteBtn);
          });
        }
      }
    },
    error: function () {
      $("#noUser").removeClass("d-none");
    },
  });
}

function filterPersonnelByDepartment(departmentID) {
  $.ajax({
    type: "GET",
    url: "libs/php/filterPersonnelByDepartment.php",
    data: { id: departmentID },
    dataType: "json",
    success: function (result) {
      if (result.status.code === "200") {
        var personnelTableBody = document.getElementById("personnelTableBody");

        if (result.data.found.length < 1) {
          $("#personnelTableBody").empty();
          var row = personnelTableBody.insertRow();
          var noUser = row.insertCell();
          noUser.classList = "align-middle text-nowrap";
          var noUserText = document.createTextNode("No personnel found");
          noUser.append(noUserText);
        } else {
          $("#personnelTableBody").empty();
          result.data.found.forEach(function (item, index) {
            var row = personnelTableBody.insertRow();
            var name = row.insertCell();
            name.classList = "align-middle text-nowrap";
            var firstName = document.createTextNode(item.firstName);
            var lastName = document.createTextNode(item.lastName);
            name.append(lastName);
            name.append(", ");
            name.append(firstName);
            var department = row.insertCell();
            department.classList =
              "align-middle text-nowrap d-none d-md-table-cell";
            var departmentText = document.createTextNode(item.departmentName);
            department.append(departmentText);
            var location = row.insertCell();
            location.classList =
              "align-middle text-nowrap d-none d-md-table-cell";
            var locationText = document.createTextNode(item.locationName);
            location.append(locationText);
            var email = row.insertCell();
            email.classList = "align-middle text-nowrap d-none d-md-table-cell";
            var emailText = document.createTextNode(item.email);
            email.append(emailText);

            var actions = row.insertCell();
            actions.classList = "align-middle text-end text-nowrap";
            var editBtn = document.createElement("button");
            editBtn.setAttribute("data-bs-toggle", "modal");
            editBtn.setAttribute("data-bs-target", "#editPersonnelModal");
            editBtn.setAttribute("data-id", item.id);
            var editIcon = document.createElement("i");
            editIcon.classList = "fa-solid fa-pencil fa-fw ";
            editBtn.classList = "btn bg-primary text-light btn-sm";
            editBtn.appendChild(editIcon);

            var deleteBtn = document.createElement("button");
            deleteBtn.setAttribute("data-id", item.id);
            deleteBtn.classList =
              "btn bg-primary text-light deletePersonnelBtn btn-sm";
            var deleteIcon = document.createElement("i");
            deleteIcon.classList = "fa-solid fa-trash fa-fw ";
            deleteBtn.appendChild(deleteIcon);
            actions.append(editBtn);
            actions.append(" ");
            actions.append(deleteBtn);
          });
        }
      }
    },
    error: function () {
      $("#noUser").removeClass("d-none");
    },
  });
}
function filterPersonnelByLocation(locationID) {
  $.ajax({
    type: "GET",
    url: "libs/php/filterPersonnelByLocation.php",
    data: { id: locationID },
    dataType: "json",
    success: function (result) {
      if (result.status.code === "200") {
        var personnelTableBody = document.getElementById("personnelTableBody");

        if (result.data.found.length < 1) {
          $("#personnelTableBody").empty();
          var row = personnelTableBody.insertRow();
          var noUser = row.insertCell();
          noUser.classList = "align-middle text-nowrap";
          var noUserText = document.createTextNode("No personnel found");
          noUser.append(noUserText);
        } else {
          $("#personnelTableBody").empty();
          result.data.found.forEach(function (item, index) {
            var row = personnelTableBody.insertRow();
            var name = row.insertCell();
            name.classList = "align-middle text-nowrap";
            var firstName = document.createTextNode(item.firstName);
            var lastName = document.createTextNode(item.lastName);
            name.append(lastName);
            name.append(", ");
            name.append(firstName);
            var department = row.insertCell();
            department.classList =
              "align-middle text-nowrap d-none d-md-table-cell";
            var departmentText = document.createTextNode(item.departmentName);
            department.append(departmentText);
            var location = row.insertCell();
            location.classList =
              "align-middle text-nowrap d-none d-md-table-cell";
            var locationText = document.createTextNode(item.locationName);
            location.append(locationText);
            var email = row.insertCell();
            email.classList = "align-middle text-nowrap d-none d-md-table-cell";
            var emailText = document.createTextNode(item.email);
            email.append(emailText);

            var actions = row.insertCell();
            actions.classList = "align-middle text-end text-nowrap";
            var editBtn = document.createElement("button");
            editBtn.setAttribute("data-bs-toggle", "modal");
            editBtn.setAttribute("data-bs-target", "#editPersonnelModal");
            editBtn.setAttribute("data-id", item.id);
            var editIcon = document.createElement("i");
            editIcon.classList = "fa-solid fa-pencil fa-fw ";
            editBtn.classList = "btn bg-primary text-light btn-sm";
            editBtn.appendChild(editIcon);

            var deleteBtn = document.createElement("button");
            deleteBtn.setAttribute("data-id", item.id);
            deleteBtn.classList =
              "btn bg-primary text-light deletePersonnelBtn btn-sm";
            var deleteIcon = document.createElement("i");
            deleteIcon.classList = "fa-solid fa-trash fa-fw ";
            deleteBtn.appendChild(deleteIcon);
            actions.append(editBtn);
            actions.append(" ");
            actions.append(deleteBtn);
          });
        }
      }
    },
    error: function () {
      $("#noUser").removeClass("d-none");
    },
  });
}
