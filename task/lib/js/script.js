$(window).on('load', function () {
    if ($('#preloader').length) {
    $('#preloader').delay(1000).fadeOut('slow', function () {
    $(this).remove();
    });
    }
});

$('#subOcean').click(function(){
    $.ajax({
        url: "lib/php/getOcean.php",
        type: 'POST',
        dataType: 'json',
        data: {
            lat: $('#oceanLat').val(),
            lng: $('#oceanLng').val()
        },
        success: function(result) {

            console.log(JSON.stringify(result));
        
            if (result.status.name == "ok") {

                $('#oceanName').html(result['data']['ocean']['name']);
                $('#oceanDistance').html(result['data']['ocean']['distance']);
                $('#oceanGeonameId').html(result['data']['ocean']['geonameId']);
                

            }
        
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // your error code
        }
    }); 
})
$('#subTimezone').click(function(){
    $.ajax({
        url: "lib/php/getTimezone.php",
        type: 'POST',
        dataType: 'json',
        data: {
            lat: $('#timeLat').val(),
            lng: $('#timeLng').val()
        },
        success: function(result) {

            console.log(JSON.stringify(result));
        
            if (result.status.name == "ok") {

                $('#timezoneLat').html(result['data']['lat']);
                $('#timezoneLng').html(result['data']['lng']);
                $('#timezoneGmtOff').html(result['data']['gmtOffset']);
                $('#timezonedstOff').html(result['data']['dstOffset']);
                $('#timezonedrawOff').html(result['data']['rawOffset'])
                
                
            }
        
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // your error code
        }
    }); 
})
$('#subCountry').click(function(){
    $.ajax({
        url: "lib/php/getCountry.php",
        type: 'POST',
        dataType: 'json',
        data: {
            country: $('#selCountry').val()
        },
        success: function(result) {

            console.log(JSON.stringify(result));
            console.log(result['data']['geonames'][0]['name'])
        
            if (result.status.name == "ok") {

                $('#country').html(result['data']['geonames'][0]['name']);
                $('#country2').html(result['data']['geonames'][1]['name']);
                $('#country3').html(result['data']['geonames'][2]['name']);
                
            }
        
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // your error code
        }
    }); 
})
