const debug = require('debug')('defcon-snoop');
const { execSync } = require('child_process');
const dnsSync = require('dns-sync');

function activateWifi() {

}

function disableWifi() {

}

function connected(fn) {
    let resolved = dnsSync.resolve('www.google.com');
    if (!resolved) {
        console.log("No connection");
        return false;
    } else {
        console.log("Connected to internet");
        return true;
    }
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