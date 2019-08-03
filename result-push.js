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
    execSync('home/bjowes/Dropbox-Uploader/dropbox-uploader.sh upload /home/bjowes/defcon-snooper/snoop.db snoop.db', (err, stdout, stderr) => {
        if (err) {
            // node couldn't execute the command
            debug(err);
            throw err;
          }
    });
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