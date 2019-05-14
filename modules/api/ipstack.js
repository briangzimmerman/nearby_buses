const config = require(__dirname+'/../../config.json');
const publicIp = require('public-ip');
const rp = require('request-promise');

function getLocation() {
    return publicIp.v4()
    .then((ip) => {
        return rp({
            uri: `http://api.ipstack.com/${ip}`,
            qs:{
                access_key: config.ipstack_api_key
            },
            json: true
        })
    })
    .then((ip_data) => {
        return ip_data
    });
}

module.exports = {
    getLocation
};