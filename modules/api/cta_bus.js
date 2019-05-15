const config = require(__dirname+'/../../config.json');
const rp = require('request-promise');
var buses = [];

function getPredictions() {
    return rp({
        uri: 'http://www.ctabustracker.com/bustime/api/v2/getpredictions',
        qs: {
            key: config.cta_api_key,
            stpid: config.bus_stops.join(','),
            format: 'json'
        },
        json: true
    })
    .then((response) => {
        var routes = [];
        var new_buses = [];
        var predictions = [];

        response['bustime-response'].prd.forEach((bus) => {
            if(routes.includes(bus.rt+bus.rtdir)) { return; }

            routes.push(bus.rt+bus.rtdir);
            new_buses.push(bus.vid);
            predictions.push({
                stop_name: bus.stpnm,
                rtdir: bus.rtdir,
                rt: bus.rt,
                dest: bus.des,
                arr_time: bus.prdtm
            });
        });

        buses = new_buses;
        return predictions;
    });
}

function getLocations() {
    return rp({
        uri: 'http://www.ctabustracker.com/bustime/api/v2/getvehicles',
        qs: {
            key: config.cta_api_key,
            vid: buses.join(','),
            format: 'json'
        },
        json: true
    })
    .then((response) => {
        var bus_info = [];

        response['bustime-response'].vehicle.forEach((bus) => {
            bus_info.push({
                vid: bus.vid,
                lat: bus.lat * 1,
                lon: bus.lon * 1,
                rt: bus.rt,
                dest: bus.des
            });
        });

        return bus_info;
    });
}

module.exports = {
    getPredictions,
    getLocations
};