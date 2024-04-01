$(window).on('load', function(){
    if($('#preloader').length){
        $('#preloader').delay(1000).fadeOut('slow',function(){
            $(this).remove();
        });
    }
})

var map = L.map('map');
map.setView([51.505, -0.09], 13);
L.tileLayer('https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=PHMMuztBx7eYSKdGlK68', {
    maxZoom: 13,
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
}).addTo(map);
navigator.geolocation.getCurrentPosition(success, error);
let marker, circle, zoomed;
function success(position){
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;
  const accuracy = position.coords.accuracy;
 if (marker){
    map.removeLayer(marker);
    map.removeLayer(circle);
 }
 marker = L.marker([lat, lng]).addTo(map);
 circle = L.circle([lat, lng], {radius: accuracy}).addTo(map);
if(!zoomed){
  zoomed = map.fitBounds(circle.getBounds());
}
  map.setView([lat, lng]);
}

function error(err){

  if (err.code ===1){
    alert("Please allow geolocation access");
  }else{
    alert("Cannot get current location");
  }
}
 


$.ajax({
    url:"lib/php/geoJson.php",
    type: 'POST',
    dataType: "json",

success: function(result) {    
    for (var i=0; i<result.data.border.features.length; i++) {
        $('#selectCountry').append($('<option>', {
            value: result.data.border.features[i].properties.iso_a3,
            text: result.data.border.features[i].properties.name,
        }));
var my_options = $("#selectCountry option");
var selected = $("#selectCountry").val();
my_options.sort(function(a,b) {
    if (a.text > b.text) return 1;
    if (a.text < b.text) return -1;
    return 0
})

$("#selectCountry").empty().append( my_options );
$("#selectCountry").val(selected);
       }
    }
});

var border ;

$('#selectCountry').change(function() {
  if (marker){
    map.removeLayer(marker);
    map.removeLayer(circle);
 }
     let name = $('#selectCountry').val();
     let countryName = $('#selectCountry>option:selected').text();
     $.ajax({
      url: "lib/php/getCountryInfo.php",
      type: 'POST',
      dataType: 'json',
      data: {
          country: countryName,
          countryCode: name
      },
      success: function(result) {

          console.log(JSON.stringify(result));
          console.log(name)
          console.log(countryName)
          if (result.status.name == "ok") {
            $.ajax({
              url: "lib/php/geoJson.php",
              type: 'POST',
              dataType: 'json',
              success: function(result) {
                const filterData = result.data.border.features.filter((a) => (a.properties.iso_a3 === name));
                border = L.geoJSON(filterData[0]); 
                zoomed = map.fitBounds(border.getBounds());
                  }
                })
          }
      
      },
      error: function(jqXHR, textStatus, errorThrown) {
          // your error code
      }
  }); 
    
        });
        
