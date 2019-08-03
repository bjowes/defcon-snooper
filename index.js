

const wifiScanInterval = 1 * 60 * 1000;
const wifiScan = require('./wifi-scan-parse');

setInterval(() => {
    console.log('Scanning Wifi networks');
    wifiScan.scanWifiNetworksAndInsert();
}, wifiScanInterval);


