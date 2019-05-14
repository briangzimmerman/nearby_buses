const config = require('../../config.json');
const publicIp = require('public-ip');
const rp = require('request-promise');

function getZip() {
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
        return ip_data.zip
    });
}

module.exports = {
    getZip
};