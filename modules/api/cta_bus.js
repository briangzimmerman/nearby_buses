const config = require('../../config.json');
const rp = require('request-promise');
const fs = require('fs');
const csv_parse = require('csv-parse/lib/sync');
var lat;
var lon;
var stops = [];
var routes = [];

function setLatLon(new_lat, new_lon) {
    lat = new_lat;
    lon = new_lon;
}

function findCloseStops() {
    var file_data = fs.readFileSync(__dirname+'/../../data_files/cta_bus_stops.csv');
    var all_stops = csv_parse(file_data, {
        columns: true,
        skip_empty_lines: true
    });
    var close_stops = [];

    all_stops.forEach((stop) => {

    });
}

module.exports = {
    findCloseStops
};