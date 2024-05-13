//-------------------------------------------------------------------------------------------
// GLOBAL DECLARATIONS
//-------------------------------------------------------------------------------------------
var map;

// Tile layers
var Street = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
});

var StamenTerrain = L.tileLayer(
  "https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.{ext}",
  {
    minZoom: 0,
    maxZoom: 18,
    attribution:
      '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    ext: "png",
  }
);

// Basemaps

var baseMaps = {
  Street: Street,
  Terrain: StamenTerrain,
};

// overlays

var airports = L.markerClusterGroup({
  polygonOptions: {
    fillColor: "green",
    color: "yellow",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.5,
  },
});

var cities = L.markerClusterGroup({
  polygonOptions: {
    fillColor: "green",
    color: "yellow",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.5,
  },
});

var overlays = {
  Airports: airports,
  Cities: cities,
};
// icons

var airportIcon = L.ExtraMarkers.icon({
  prefix: "fa",
  icon: "fa-solid fa-plane",
  iconColor: "white",
  markerColor: "blue",
  shape: "square",
});

var cityIcon = L.ExtraMarkers.icon({
  prefix: "fa",
  icon: "fa-solid fa-city",
  markerColor: "green",
  shape: "square",
});
var iso2, countryName, sanitizedCountryName, polygon;
// ---------------------------------------------------------
// EVENT HANDLERS
// ---------------------------------------------------------

// initialise map and add controls & markers when DOM is ready

$(window).load(function () {
  navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
  map = L.map("map", {
    layers: [Street],
  });

  L.easyButton("fa-solid fa-info", function (btn, map) {
    $("#infoModal").modal("show");
  }).addTo(map);
  L.easyButton("fa-solid fa-cloud", function (btn, map) {
    $("#weatherModal").modal("show");
  }).addTo(map);

  L.easyButton("fa-solid fa-coins", function (btn, map) {
    $("#currencyModal").modal("show");
  }).addTo(map);

  L.easyButton("fa-solid fa-wikipedia-w", function (btn, map) {
    $("#wikiModal").modal("show");
  }).addTo(map);

  L.easyButton("fa-solid fa-newspaper", function (btn, map) {
    $("#newsModal").modal("show");
  }).addTo(map);

  L.control.layers(baseMaps, overlays).addTo(map);
  airports.addTo(map);
  cities.addTo(map);
  changeCountry();
  preloader();
});
// Preloader
function preloader() {
  if ($("#preloader").length) {
    $("#preloader")
      .delay(1000)
      .fadeOut("slow", function () {
        $(this).remove();
      });
  }
}

function locationSuccess(position) {
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;

  // Getting country codes and names from countryBorders.geo.json
  $.ajax({
    url: "lib/php/getCountry.php",
    type: "POST",
    dataType: "json",
    data: {
      latitude: lat,
      longitude: lng,
    },
    success: function (result) {
      if (result.status.code == 200) {
        iso2 = result.data[0]["iso2"];
        countryName = result.data[0]["countryName"];
        sanitizedCountryName = encodeURI(countryName);
        getCountryName();
        getCountryFeature();
        getAirports();
        getCities();
        getCountryDetails();
        getWiki();
        getExchange();
        getNews();
      } else {
        showMessage("Error retrieving country data", 4000, false);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      showMessage("Opencage - server error", 4000, false);
    },
  });
}

// Function to get country information when selected
function changeCountry() {
  $("#selectCountry").change(function () {
    removeMarkersPolygon();
    iso2 = $("#selectCountry").val();
    countryName = $("#selectCountry>option:selected").text();
    sanitizedCountryName = encodeURI(countryName);
    getCountryFeature();
    getAirports();
    getCities();
    getCountryDetails();
    getWiki();
    getExchange();
    getNews();
  });
}

function locationError(err) {
  if (err.code === 1) {
    alert("Please allow geolocation access");
  } else {
    alert("Cannot get current location");
  }
}
function getCountryName() {
  $.ajax({
    url: "lib/php/getCountryISO2AndName.php",
    type: "POST",
    dataType: "json",
    success: function (result) {
      for (var i = 0; i < result.data.length; i++) {
        $("#selectCountry").append(
          $("<option>", {
            value: result.data[i].code,
            text: result.data[i].name,
          })
        );
        $("#selectCountry").val(iso2).prop("selected", true);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      // your error code
    },
  });
}

// Getting feature of a country
function getCountryFeature() {
  $.ajax({
    url: "lib/php/getFeature.php",
    type: "POST",
    dataType: "json",
    data: {
      iso_2: iso2,
    },
    success: function (result) {
      const border = L.geoJSON(result.data[0]);
      map.fitBounds(border.getBounds());
      let latLngs;
      if (result.data[0].geometry.coordinates.length > 1) {
        latLngs = L.GeoJSON.coordsToLatLngs(
          result.data[0].geometry.coordinates,
          2
        );
      } else {
        latLngs = L.GeoJSON.coordsToLatLngs(
          result.data[0].geometry.coordinates[0]
        );
      }

      polygon = L.polygon(latLngs, {
        color: "green",
        weight: 1,
        opacity: 1,
      }).addTo(map);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      // your error code
    },
  });
}
// Getting a country information
function getAirports() {
  $.ajax({
    url: "lib/php/airports.php",
    type: "POST",
    dataType: "json",
    data: {
      countryCode: iso2,
    },
    success: function (result) {
      if (result.status.code == 200) {
        result.data.forEach(function (item) {
          L.marker([item.latitude, item.longitude], { icon: airportIcon })
            .bindTooltip(item.name, { direction: "top", sticky: true })
            .addTo(airports);
        });
      } else {
        showMessage("Error retrieving airport data", 4000, false);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      showMessage(
        "Can't retrieve airport information from Api Ninja - server error",
        4000,
        false
      );
    },
  });
}
function getCities() {
  $.ajax({
    url: "lib/php/cities.php",
    type: "POST",
    dataType: "json",
    data: {
      countryCode: iso2,
    },
    success: function (result) {
      if (result.status.code == 200) {
        result.data.forEach(function (item) {
          L.marker([item.latitude, item.longitude], { icon: cityIcon })
            .bindTooltip(item.name, { direction: "top", sticky: true })
            .addTo(cities);
        });
      } else {
        showMessage("Error retrieving country data", 4000, false);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      showMessage(
        "Can't retrieve city information from Api Ninja - server error",
        4000,
        false
      );
    },
  });
}
// Getting a country information
function getCountryDetails() {
  $.ajax({
    url: "lib/php/getCountryDetails.php",
    type: "POST",
    dataType: "json",
    data: {
      selectCountry: sanitizedCountryName,
      countryCode: iso2,
    },
    success: function (result) {
      if (result.status.code == 200) {
        latitude = result["data"][0]["latitude"];
        longitude = result["data"][0]["longitude"];
        getWeather();
        $(".name").text(result["data"][0]["name"]);
        $("#capital").text(result["data"][0]["capital"]);
        $("#flag").attr("src", result["data"][0]["flag"]);
        $("#population").text(
          numeral(result["data"][0]["population"]).format("0,0")
        );
        $("#continent").text(result["data"][0]["continent"]);
        $("#area").text(numeral(result["data"][0]["area"]).format("0,0"));
        let currency = result["data"][0]["currency"];
        let keys = Object.keys(currency);
        $("#currency").html(`${keys}`);
        let weekStart = result["data"][0]["weekStarts"];
        $("#week").text(weekStart.charAt(0).toUpperCase() + weekStart.slice(1));
        let language = result["data"][0]["languages"];
        Object.keys(language).forEach((key) => {
          $("#language").html(`${language[key]}`);
        });
      } else {
        showMessage("Error retrieving country data", 4000, false);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      showMessage("Rest Countries - server error", 4000, false);
    },
  });
}
function getWiki() {
  $.ajax({
    url: "lib/php/getWikipedia.php",
    type: "POST",
    dataType: "json",
    data: {
      selectCountry: sanitizedCountryName,
    },
    success: function (result) {
      if (result.status.code == 200) {
        $("#wikiUrl").attr("href", result.data[0].link);
        $("#wikiUrlTitle").text(result.data[0].link);
      } else {
        showMessage("Error retrieving wikipedia data", 4000, false);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      showMessage("Wikimedia - server error", 4000, false);
    },
  });
}
function getWeather() {
  $.ajax({
    url: "lib/php/getWeather.php",
    type: "POST",
    dataType: "json",
    data: {
      latitude: latitude,
      longitude: longitude,
    },
    success: function (result) {
      if (result.status.code == 200) {
        const days = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        setInterval(() => {
          const time = new Date();
          const month = time.getMonth();
          const date = time.getDate();
          const day = time.getDay();
          const hour = time.getHours();
          const hoursIn12HrFormat = hour >= 13 ? hour % 12 : hour;
          const minutes = time.getMinutes();
          const ampm = hour >= 12 ? "PM" : "AM";
          $("#time").html(
            (hoursIn12HrFormat < 10
              ? "0" + hoursIn12HrFormat
              : hoursIn12HrFormat) +
              ":" +
              (minutes < 10 ? "0" + minutes : minutes) +
              " " +
              `<span id="am-pm">${ampm}</span>`
          );
          $("#date").html(days[day] + ", " + date + " " + months[month]);
        }, 1000);
        let { humidity, pressure, sunrise, sunset, temp } = result.data.current;
        $("#time-zone").html(result.data.timezone);
        $("#country").html(countryName);
        $("#current-weather-items").html(`<div class="weather-item">
                    <div>Humidity</div>
                    <div>${humidity}%</div>
                </div>
                <div class="weather-item">
                    <div>Pressure</div>
                    <div>${pressure}</div>
                </div>
                <div class="weather-item">
                    <div>Temperature</div>
                    <div>${Math.round(temp)} &deg;c</div>
                </div>
            
                <div class="weather-item">
                    <div>Sunrise</div>
                    <div>${window
                      .moment(sunrise * 1000)
                      .format("HH:mm a")}</div>
                </div>
                <div class="weather-item">
                    <div>Sunset</div>
                    <div>${window.moment(sunset * 1000).format("HH:mm a")}</div>
                </div>
                `);
        let otherDaysForcast = "";
        result.data.daily.forEach((day, idx) => {
          if (idx == 0) {
            $("#current-temp").html(`
                    <img src="http://openweathermap.org/img/wn//${
                      day.weather[0].icon
                    }@4x.png" alt="weather icon" class="w-icon">
                    <div class="other">
                        <div class="day">${window
                          .moment(day.dt * 1000)
                          .format("dddd")}</div>
                        <div class="temp">${Math.round(
                          day.temp.day
                        )}&#176;C</div>
                        <div class="temp">${Math.round(
                          day.temp.night
                        )}&#176;C</div>
                    </div>
                    
                    `);
          } else {
            otherDaysForcast += `
            <div class="weather-forecast-item">
                <div class="day">${window
                  .moment(day.dt * 1000)
                  .format("ddd")}</div>
                <img src="http://openweathermap.org/img/wn/${
                  day.weather[0].icon
                }@2x.png" alt="weather icon" class="w-icon">
                <div class="temp">${Math.round(day.temp.day)}&#176;C</div>
                <div class="temp">${Math.round(day.temp.night)}&#176;C</div>
            </div>
            
            `;
          }
        });
        $("#weather-forecast").html(otherDaysForcast);
      } else {
        showMessage("Error retrieving weather data", 4000, false);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      showMessage("OpenWeather - server error", 4000, false);
    },
  });
}
function getExchange() {
  $.ajax({
    url: "lib/php/getExchangeRate.php",
    type: "GET",
    dataType: "json",
    success: function (result) {
      if (result.status.code == 200) {
        const currencies = result.data.rates;
        $.each(currencies, function (key, value) {
          $("#exchangeRate").append($("<option>", { value: value }).text(key));
          function calcResult() {
            $("#toAmount").val(
              numeral($("#fromAmount").val() * $("#exchangeRate").val()).format(
                "0,0.00"
              )
            );
          }

          $("#fromAmount").on("keyup", function () {
            calcResult();
          });

          $("#fromAmount").on("change", function () {
            calcResult();
          });

          $("#exchangeRate").on("change", function () {
            calcResult();
          });

          $("#currencyModal").on("show.bs.modal", function () {
            calcResult();
          });
        });
      } else {
        showMessage("Error retrieving country data", 4000, false);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      showMessage("OpenExchange - server error", 4000, false);
    },
  });
}
function getNews() {
  // Get yesterday's date to get news published after yesterday's date

  $.ajax({
    url: "lib/php/getNews.php",
    type: "POST",
    dataType: "json",
    data: {
      countryCode: iso2,
    },
    success: function (result) {
      if (result.status.code == 200) {
        $("#newsModalBody").empty();
        for (let i = 0; i < result.data.length; i++) {
          $("#newsModalBody")
            .append(`<a href="${result.data[i].link}" target="_blank" class="single-news-link"><div class="row single-news">
            <div class="col-4"><img src="${result.data[i].icon}" alt="" id="newsImage"></div>
            <div class="col-8">
              <h6>${result.data[i].title}</h6>
              <div class="row">
                <div class="col-6"><p class="news-published">Published On: <br>${result.data[i].published}</p></div>
                <div class="col-6"><p class="news-published">Source: <br>${result.data[i].source}</p></div>
              </div>
            </div>
          </div></a>`);
        }
      } else {
        showMessage("Error retrieving news data", 4000, false);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      showMessage("Newsdata - server error", 4000, false);
    },
  });
}
function removeMarkersPolygon() {
  if (polygon) {
    map.removeLayer(polygon);
  }
  if (airports) {
    airports.clearLayers();
  }
  if (cities) {
    cities.clearLayers();
  }
}
function showMessage(message, duration, close) {
  Toastify({
    text: message,
    duration: duration,
    newWindow: true,
    close: close,
    gravity: "top", // `top` or `bottom`
    position: "center", // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: {
      background: "#870101",
    },
    onClick: function () {}, // Callback after click
  }).showToast();
}
