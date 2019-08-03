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
    execSync('~/dropbox-upload/dropbox-upload.sh upload ~/defcon-snooper/snoop.db snoop.db', (err, stdout, stderr) => {
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