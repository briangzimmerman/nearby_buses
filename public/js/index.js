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
var bus_layer = new ol.layer.Vector({
    style: function(feature) {
        return [
            new ol.style.Style({
                text: new ol.style.Text({
                    text: feature.get('rt')+' - '+feature.get('dest'),
                    textBaseLine: 'bottom',
                    backgroundFill: new ol.style.Fill({color: '#333'}),
                    fill: new ol.style.Fill({color: '#fff'}),
                    padding: [2, 2, 2, 2],
                    offsetY: -58,
                    font: '13px Ubuntu'
                })
            }),
            new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.5, 1],
                    src: '/images/bus_marker2.png',
                    scale: .2,
                })
            })
        ];
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
            rt: location.rt,
            dest: location.dest,
            geometry: new ol.geom.Point(ol.proj.fromLonLat([location.lon, location.lat]))
        }));
    });

    bus_layer.setSource(new ol.source.Vector({
        features: buses
    }));
});

socket.on('bus_predictions', function(bus_predictions) {
    $bus_predictions.html('');
    console.log(bus_predictions);

    bus_predictions.sort(function(a, b) {
        if(a.rt - b.rt) { return a.rt - b.rt }
        else if(a.dest < b.dest) { return -1; }
        else if(a.dest > b.dest) { return 1; }
        else { return 0; }
    });

    bus_predictions.forEach(function(prediction) {
        $bus_predictions.append(Mustache.render(bus_prediction_template, {
            route: prediction.rt + ' - ' + prediction.dest,
            stop_name: prediction.stop_name,
            eta: getEta(prediction.arr_time)
        }));
    });
});

socket.on('location', function(location) {
    map = createMap(location.lon, location.lat, 14);
});

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
            bus_layer
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([lon, lat]),
            zoom: zoom
        })
    });
}