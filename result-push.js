const debug = require('debug')('defcon-snoop');
const { execSync } = require('child_process');

function activateWifi() {

}

function disableWifi() {

}

function connected() {
    return true;
}

function uploadToDropbox() {
    let res = execSync('/home/bjowes/Dropbox-Uploader/dropbox_uploader.sh upload /home/bjowes/defcon-snooper/snoop.db snoop.db');
    console.log(res);
    debug(res);
}

function resultPush() {
    activateWifi();
    if (connected()) {
        uploadToDropbox();
    }
    disableWifi();
}

module.exports = {
    resultPush
};