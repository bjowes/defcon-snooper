

const wifiScanInterval = 15 * 1000;
const wifiScan = require('./wifi-scan-parse');

wifiScan.scanWifiNetworksAndInsert();
setInterval(() => {
    let now = new Date();
    console.log(now, 'Scanning Wifi networks');
    wifiScan.scanWifiNetworksAndInsert();
    //wifiScan.getWifisFromDb();
}, wifiScanInterval);


const resultPushInterval = 60 * 60 * 1000;
const resultPush = require('./result-push');

resultPush.resultPush();
setInterval(() => {
    let now = new Date();
    console.log(now, 'Uploading DB to dropbox');
    resultPush.resultPush();
}, resultPushInterval);
