const config = require(__dirname+'/config.json');
const bus = require(__dirname+'/modules/api/cta_bus');
const hbs = require('hbs');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

var refresh_interval = false;
var bus_predictions = [];
var bus_locations = [];

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

//------------------------------------------------------------------------------
//Socket stuff

io.on('connection', (socket) => {
    console.log('User connected');

    if(!refresh_interval) {
        refresh_interval = createInterval();
    }

    socket.emit('bus_predictions', bus_predictions);
    socket.emit('bus_locations', bus_locations);
});

//------------------------------------------------------------------------------
//Functions

function createInterval() {
    return setInterval(() => {
        if(!io.engine.clientsCount) { return; }

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

    }, 30000);
}