const config = require(__dirname+'/config.json');
const bus = require(__dirname+'/modules/api/cta_bus');
const ipstack = require(__dirname+'/modules/api/ipstack');
const hbs = require('hbs');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

var bus_predictions = [];
var bus_locations = [];
var lat = null;
var lon = null;

//------------------------------------------------------------------------------
//Server stuff

hbs.registerPartials(`${__dirname}/views/partials`);
app.set('view_engine', 'hbs');
app.use(express.static(`${__dirname}/public`));

server.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}...`);
});

app.get('/', (req, res) => {
    res.render('index.hbs');
});

setInterval(update, 30000)

ipstack.getLocation()
.then((location) => {
    lat = location.latitude;
    lon = location.longitude;

    io.emit('location', {lat, lon});
});

//------------------------------------------------------------------------------
//Socket stuff

io.on('connection', (socket) => {
    console.log('User connected');

    socket.emit('location', {lat, lon});

    if(bus_predictions.length) {
        socket.emit('bus_predictions', bus_predictions);
        socket.emit('bus_locations', bus_locations);
    } else {
        update();
    }
});

//------------------------------------------------------------------------------
//Functions

function update() {
    if(!io.engine.clientsCount) {
        bus_predictions = [];
        bus_locations = [];
        return;
    }

    bus.getPredictions()
    .then((predictions) => {
        io.emit('bus_predictions', predictions);
        bus_predictions = predictions;
        return bus.getLocations();
    })
    .then((locations) => {
        bus_locations = locations;
        io.emit('bus_locations', locations);
    });
}