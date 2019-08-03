

const wifiScanInterval = 15 * 1000;
const wifiScan = require('./wifi-scan-parse');

setInterval(() => {
    console.log('Scanning Wifi networks');
    wifiScan.scanWifiNetworksAndInsert();
    wifiScan.getWifisFromDb();
}, wifiScanInterval);


