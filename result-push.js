const debug = require('debug')('defcon-snoop');
const { execSync } = require('child_process');
const dns = require('dns');

function activateWifi() {

}

function disableWifi() {

}

function connected() {
    dns.resolve('www.google.com', function(err) {
        if (err) {
           console.log("No connection");
           return false;
        } else {
           console.log("Connected to internet");
           return true;
        }
    });
}

function uploadToDropbox() {
    let res = execSync('/home/bjowes/Dropbox-Uploader/dropbox_uploader.sh upload /home/bjowes/defcon-snooper/snoop.db snoop.db').toString();
    console.log(res);
    debug(res);
}

function resultPush() {
    try {
        activateWifi();
        if (connected()) {
            uploadToDropbox();
        }
        disableWifi();
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    resultPush
};