var socket = io();
var bus_prediction_template = $('#bus_prediction_template').html();
var $bus_predictions = $('#bus_container');
var map;
var styles = {
    'bus_marker': new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 1],
            src: '/images/bus_marker2.png',
            // imgSize: [50, 50],
            scale: .2
        })
    })
};
var layer = new ol.layer.Vector({
    style: function(feature) {
        return styles[feature.get('type')];
    }
});

socket.on('bus_locations', function(bus_locations) {
    console.log(bus_locations);
    if(!map) { return; }
    var buses = [];

    bus_locations.forEach(function(location) {
        console.log(location);
        buses.push(new ol.Feature({
            type: 'bus_marker',
            geometry: new ol.geom.Point(ol.proj.fromLonLat([location.lon, location.lat]))
        }));
    });

    layer.setSource(new ol.source.Vector({
        features: buses
    }));
});

socket.on('bus_predictions', function(bus_predictions) {
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

//------------------------------------------------------------------------------
//Map

if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
        map = createMap(position.coords.longitude, position.coords.latitude, 14);
    }, function(error) {
        console.log(error);
        map = createMap(-87.623177, 41.881832, 12);
    });
} else {
    map = createMap(-87.623177, 41.881832, 12);
}

//------------------------------------------------------------------------------

function getEta(arrival) {
    var diff = moment(arrival, 'YYYYMMDD HH:mm').valueOf() - Date.now();
    if(diff < 60000) {
        return '< 1 minute';
    } else {
        var minutes = Math.round(diff / 60000);
        return minutes + ' minute' + (minutes > 1 ? 's' : '');
    }
}

function createMap(lon, lat, zoom) {
    return new ol.Map({
        target: 'map_container',
        layers: [
            new ol.layer.Tile({
              source: new ol.source.OSM()
            }),
            layer
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([lon, lat]),
            zoom: zoom
        })
    });
}