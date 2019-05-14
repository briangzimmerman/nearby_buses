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

        io.emit('bus_predictions', [
            {
              "stop_name": "Marine Drive & Bittersweet",
              "rtdir": "Northbound",
              "rt": "146",
              "dest": "Wilson/Marine",
              "arr_time": "20190514 13:52"
            },
            {
              "stop_name": "Broadway & Irving Park",
              "rtdir": "Southbound",
              "rt": "36",
              "dest": "LaSalle Metra Station",
              "arr_time": "20190514 13:53"
            },
            {
              "stop_name": "Marine Drive & Bittersweet",
              "rtdir": "Southbound",
              "rt": "146",
              "dest": "Museum Campus",
              "arr_time": "20190514 13:56"
            },
            {
              "stop_name": "Broadway & Belle Plaine",
              "rtdir": "Northbound",
              "rt": "36",
              "dest": "Devon/Clark",
              "arr_time": "20190514 13:57"
            },
            {
              "stop_name": "Irving Park & Broadway",
              "rtdir": "Eastbound",
              "rt": "80",
              "dest": "Broadway",
              "arr_time": "20190514 13:58"
            }
          ]);
        io.emit('bus_locations', [
            {
              "vid": "1404",
              "lat": "41.96921148300171",
              "lon": "-87.65973663330078",
              "rt": "36",
              "dest": "LaSalle Metra Station"
            },
            {
              "vid": "1898",
              "lat": "41.93982696533203",
              "lon": "-87.64439392089844",
              "rt": "36",
              "dest": "Devon/Clark"
            },
            {
              "vid": "1746",
              "lat": "41.953975677490234",
              "lon": "-87.69028962333248",
              "rt": "80",
              "dest": "Broadway"
            },
            {
              "vid": "4364",
              "lat": "41.940413198163434",
              "lon": "-87.6396235804404",
              "rt": "146",
              "dest": "Wilson/Marine"
            },
            {
              "vid": "4161",
              "lat": "41.976409912109375",
              "lon": "-87.65275573730469",
              "rt": "146",
              "dest": "Museum Campus"
            }
          ]);

        return;

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
    }, 5000);
}