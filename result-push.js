const debug = require('debug')('defcon-snoop');
const { execSync } = require('child_process');
const dnsSync = require('dns-sync');
const sleep = require('./sleep');

async function activateWifi() {
    try {
        execSync('rm /etc/wpa_supplicant/wpa_supplicant.conf');
        execSync('cp /etc/wpa_supplicant/wpa_supplicant.on /etc/wpa_supplicant/wpa_supplicant.conf');
        execSync('ip link set wlan0 up');
        execSync('wpa_cli -i wlan0 reconfigure');
        await sleep.sleep(10000);
        // TODO sleep required?
    } catch (err) {
        console.error(err);
    }
}

function disableWifi() {
    try {
        execSync('ip link set wlan0 down');
        execSync('rm /etc/wpa_supplicant/wpa_supplicant.conf');
        execSync('cp /etc/wpa_supplicant/wpa_supplicant.off /etc/wpa_supplicant/wpa_supplicant.conf');
    } catch (err) {
        console.error(err);
    }
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
    resultPush,
    uploadToDropbox
};