

const wifiScanInterval = 60 * 1000;
const wifiScan = require('./wifi-scan-parse');
const resultPush = require('./result-push');
let scanCount = 1;

wifiScan.scanWifiNetworksAndInsert();
//wifiScan.getWifisFromDb();
resultPush.resultPush();

setInterval(() => {
    let now = new Date();
    console.log(now, 'Scanning Wifi networks, index', scanCount);
    wifiScan.scanWifiNetworksAndInsert();
    scanCount++;
    if (scanCount % 60 === 0) {
        let now = new Date();
        console.log(now, 'Uploading DB to dropbox');
        resultPush.resultPush();    
    }
    //wifiScan.getWifisFromDb();
}, wifiScanInterval);

