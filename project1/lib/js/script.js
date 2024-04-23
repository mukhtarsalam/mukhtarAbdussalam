$(window).on("load", function () {
  if ($("#preloader").length) {
    $("#preloader")
      .delay(1000)
      .fadeOut("slow", function () {
        $(this).remove();
      });
  }
});
let marker,
  circle,
  zoomed,
  polyline,
  capitalMarker,
  clustergroup,
  airportGroup,
  cityGroup,
  capitalGroup,
  layerControl;
var map = L.map("map");
map.setView([54.505, -0.09], 13);
var osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);
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
var baseMaps = {
  "Open Street Map": osm,
  Terrain: StamenTerrain,
};
layerControl = L.control.layers(baseMaps).addTo(map);
navigator.geolocation.getCurrentPosition(success, error);

function success(position) {
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;
  const accuracy = position.coords.accuracy;
  if (marker) {
    map.removeLayer(marker);
    map.removeLayer(circle);
  }
  marker = L.marker([lat, lng]).addTo(map);
  circle = L.circle([lat, lng], { radius: accuracy }).addTo(map);
  if (!zoomed) {
    zoomed = map.fitBounds(circle.getBounds());
  }
  map.setView([lat, lng]);
}

function error(err) {
  if (err.code === 1) {
    alert("Please allow geolocation access");
  } else {
    alert("Cannot get current location");
  }
}

$.ajax({
  url: "lib/php/geoJson.php",
  type: "POST",
  dataType: "json",

  success: function (result) {
    for (var i = 0; i < result.data.border.features.length; i++) {
      $("#selectCountry").append(
        $("<option>", {
          value: result.data.border.features[i].properties.iso_a3,
          text: result.data.border.features[i].properties.name,
        })
      );
      var my_options = $("#selectCountry option");
      var selected = $("#selectCountry").val();
      my_options.sort(function (a, b) {
        if (a.text > b.text) return 1;
        if (a.text < b.text) return -1;
        return 0;
      });

      $("#selectCountry").empty().append(my_options);
      $("#selectCountry").val(selected);
    }

    var border;

    $("#selectCountry").change(function () {
      if (marker) {
        map.removeLayer(marker);
        map.removeLayer(circle);
      }
      if (clustergroup) {
        map.removeLayer(clustergroup);
        airportGroup.clearLayers();
      }
      $("#icons").show();
      let name = $("#selectCountry").val();
      let countryName = $("#selectCountry>option:selected").text();
      let removedot = countryName.replaceAll(".", "");
      let sanitizedCountryName = removedot.replaceAll(" ", "_");
      $.ajax({
        url: "lib/php/getCountryInfo.php",
        type: "POST",
        dataType: "json",
        data: {
          country: sanitizedCountryName,
          countryCode: name,
        },
        success: function (result) {
          const countryComponents = result.data.results[0].components;
          const countryGeometry = result.data.results[0].geometry;
          const countName = countryComponents.country;
          const countryLat = countryGeometry.lat;
          const countryLng = countryGeometry.lng;
          let iso_2 = "ISO_3166-1_alpha-2";
          const iso2 = result.data.results[0].components[iso_2];

          if (result.status.name == "ok") {
            $.ajax({
              url: "lib/php/geoJson.php",
              type: "POST",
              dataType: "json",
              success: function (result) {
                const filterData = result.data.border.features.filter(
                  (a) => a.properties.iso_a3 === name
                );
                border = L.geoJSON(filterData[0]);
                zoomed = map.fitBounds(border.getBounds());
              },
            });

            //Ajax call to multiple api
            let restCountryName = encodeURI(countName);
            $.ajax({
              url: "lib/php/apiCalls.php",
              type: "POST",
              dataType: "json",
              data: {
                country: sanitizedCountryName,
                restName: restCountryName,
                latitude: countryLat,
                longitude: countryLng,
                iso: iso2,
              },
              success: function (result) {
                let capitalLatLng = result.restCountries[0].capitalInfo.latlng;
                const capitalPopup = L.popup().setContent(
                  `Capital: ${result.restCountries[0].capital[0]}`
                );
                let airportIcon = L.icon({
                  iconUrl: "lib/css/images/plane-solid.svg",
                  iconSize: [20, 50],
                  iconAnchor: [15, 42],
                  popupAnchor: [12, -10],
                });
                let airportResult = result.apiNinja;
                let airport = [];
                let airportName = [];
                for (let i = 0; i < airportResult.length; i++) {
                  airport.push([
                    JSON.parse(airportResult[i].latitude),
                    JSON.parse(airportResult[i].longitude),
                  ]);
                  airportName.push(airportResult[i].name);
                }
                airportGroup = L.layerGroup();
                for (let i = 0; i < airport.length; i++) {
                  airportMarker = L.marker(airport[i], {
                    icon: airportIcon,
                  })
                    .bindPopup(airportName[i])
                    .addTo(airportGroup);
                }
                let cityIcon = L.icon({
                  iconUrl: "lib/css/images/city-solid.svg",
                  iconSize: [20, 50],
                  iconAnchor: [15, 42],
                  popupAnchor: [12, -10],
                });
                let cityResult = result.apiNinjaCity;
                let city = [];
                let cityName = [];
                for (let i = 0; i < cityResult.length; i++) {
                  city.push([
                    JSON.parse(cityResult[i].latitude),
                    JSON.parse(cityResult[i].longitude),
                  ]);
                  cityName.push(cityResult[i].name);
                }
                cityGroup = L.layerGroup();
                for (let i = 0; i < city.length; i++) {
                  cityMarker = L.marker(city[i], {
                    icon: cityIcon,
                  })
                    .bindPopup(cityName[i])
                    .addTo(cityGroup);
                }
                capitalGroup = L.layerGroup();
                capitalMarker = L.marker(capitalLatLng)
                  .bindPopup(capitalPopup)
                  .addTo(capitalGroup);

                clustergroup = new L.MarkerClusterGroup();
                clustergroup.addLayer(airportGroup);
                clustergroup.addLayer(cityGroup);
                clustergroup.addLayer(capitalGroup);

                var overlayMaps = {
                  Icons: clustergroup,
                };
                if (layerControl) {
                  layerControl.remove(map);
                }
                layerControl = L.control
                  .layers(baseMaps, overlayMaps)
                  .addTo(map);
                map.addLayer(clustergroup);
                let wikiLink = result.geoNames.geonames[0].wikipediaUrl;
                let newWikiLink = "https://" + wikiLink;
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
                  $("#date").html(
                    days[day] + ", " + date + " " + months[month]
                  );
                }, 1000);
                let { humidity, pressure, sunrise, sunset, temp } =
                  result.openWeather.current;
                $("#time-zone").html(result.openWeather.timezone);
                $("#country").html(
                  result.openWeather.lat + "N " + result.openWeather.lon + "E"
                );
                $("#current-weather-items").html(`<div class="weather-item">
                    <div>Humidity</div>
                    <div>${humidity}%</div>
                </div>
                <div class="weather-item">
                    <div>Pressure</div>
                    <div>${pressure}</div>
                </div>
                <div class="weather-item">
                    <div>Temprature</div>
                    <div>${temp} &deg;c</div>
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
                result.openWeather.daily.forEach((day, idx) => {
                  if (idx == 0) {
                    $("#current-temp").html(`
                    <img src="http://openweathermap.org/img/wn//${
                      day.weather[0].icon
                    }@4x.png" alt="weather icon" class="w-icon">
                    <div class="other">
                        <div class="day">${window
                          .moment(day.dt * 1000)
                          .format("dddd")}</div>
                        <div class="temp">Night - ${day.temp.night}&#176;C</div>
                        <div class="temp">Day - ${day.temp.day}&#176;C</div>
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
                <div class="temp">Night - ${day.temp.night}&#176;C</div>
                <div class="temp">Day - ${day.temp.day}&#176;C</div>
            </div>
            
            `;
                  }
                });
                $("#countryName").html(result.restCountries[0].name.common);
                $("#officialName").html(result.restCountries[0].name.official);
                $("#capital").html(result.restCountries[0].capital[0]);
                $("#flag").attr("src", result.restCountries[0].flags.png);
                $("#population").html(result.restCountries[0].population);
                $("#continent").html(result.restCountries[0].continents[0]);
                $("#subRegion").html(result.restCountries[0].subregion);
                $("#area").html(result.restCountries[0].area);
                let countryCurrency = result.restCountries[0].currencies;
                let currencyCode = Object.keys(countryCurrency)[0];
                let exchangeRates = result.openExchange.rates;

                Object.keys(countryCurrency).forEach((key) => {
                  $("#currency").html(
                    `<p>Name: ${countryCurrency[key].name}</p><p>Symbol: ${countryCurrency[key].symbol}</p> `
                  );
                  Object.keys(exchangeRates).forEach((key) => {
                    if (key === currencyCode) {
                      $("#currencyExchange")
                        .html(`<p>Name: ${countryCurrency[key].name}</p>
                      <p>Symbol: ${countryCurrency[key].symbol}(${key})</p>
                      <p>USD 1 = ${key} ${exchangeRates[key]}</p>`);
                    }
                  });
                });

                let weekstart = result.restCountries[0].startOfWeek;
                $("#weekStart").html(weekstart);

                $("#wikidata").attr("src", newWikiLink);
              },
              error: function (jqXHR, textStatus, errorThrown) {
                // your error code
              },
            });
            // end of Ajax call to multiple api
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          // your error code
        },
      });
    });
  },
});
