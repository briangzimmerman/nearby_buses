var socket = io();
var bus_prediction_template = $('#bus_prediction_template').html();
var $bus_predictions = $('#bus_container');

socket.on('bus_locations', function(bus_locations) {
    // bus_locations = JSON.parse(bus_locations);
    console.log(bus_locations);
});

socket.on('bus_predictions', function(bus_predictions) {
    // bus_predictions = JSON.parse(bus_predictions);
    $bus_predictions.html('');
    console.log(bus_predictions);

    bus_predictions.forEach(function(prediction) {
        $bus_predictions.append(Mustache.render(bus_prediction_template, {
            route: prediction.rt + ' - ' + prediction.dest,
            stop_name: prediction.stop_name,
            eta: getEta(prediction.arr_time)
        }));
    });
});

function getEta(arrival) {
    var diff = moment(arrival, 'YYYYMMDD HH:mm').valueOf() - Date.now();
    if(diff < 60000) {
        return 'Less than 1 minute';
    } else {
        var minutes = Math.round(diff / 60000);
        return minutes + ' minute' + (minutes > 1 ? 's' : '');
    }
}