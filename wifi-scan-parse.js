
const sqlite3 = require('sqlite3').verbose();
const debug = require('debug')('defcon-snoop');
const { execSync } = require('child_process');


function scanWifiNetworksAndInsert() {
    //let iwlistStr = scanWifiNetworks();
    console.log('up')
    execSync('ip link set wlan0 up');

    console.log('scan')
    let iwlistStr = execSync('iwlist wlan0 scan').toString();
    let iwlist = iwlistParse(iwlistStr);
    debug(JSON.stringify(iwlist));
    console.log(JSON.stringify(iwlist));
    let db = openDb();
    db.serialize(() => {
        createTables(db);
        insertWifis(db, iwlist);
    });
    closeDb(db);
    
    console.log('down')

    execSync('ip link set wlan0 down');
}

function getWifisFromDb() {
    let db = openDb();
    db.serialize(() => {
        getWifis(db);    
    });
    closeDb(db);
}

function iwlistParse(str) {
    var out = str.replace(/^\s+/mg, '');
    out = out.split('\n');
    var cells = [];
    var line;
    var info = {};
    var fields = {
        'mac' : /^Cell \d+ - Address: (.*)/,
        'ssid' : /^ESSID:"(.*)"/,
        'protocol' : /^IE: IEEE 802.11i\/(.*)/,
        'mode' : /^Mode:(.*)/,
        'frequency' : /^Frequency:(.*)/,
        'encryption_key' : /Encryption key:(.*)/,
        'bitrates' : /Bit Rates:(.*)/,
        'quality' : /Quality(?:=|\:)([^\s]+)/,
        'signal_level' : /Signal level(?:=|\:)([^\s]+)/
    };

    for (var i=0,l=out.length; i<l; i++) {
        line = out[i].trim();

        if (!line.length) {
            continue;
        }
        if (line.match("Scan completed :$")) {
            continue;
        }
        if (line.match("Interface doesn't support scanning.$")) {
            continue;
        }

        if (line.match(fields.mac)) {
            if (info.hasOwnProperty('mac')) {
                cells.push(info);
            }
            info = {};
        }

        for (var field in fields) {
            if (line.match(fields[field])) {
                info[field] = (fields[field].exec(line)[1]).trim();
            }
        }
    }
    cells.push(info);
    return cells;
}
 

function openDb() {
    return new sqlite3.Database('./snoop.db');
}
function createTables(db) {
    db.run("CREATE TABLE IF NOT EXISTS wifi (id INTEGER PRIMARY KEY, timestamp NUMERIC, ssid TEXT, mac TEXT, protocol TEXT, mode TEXT, frequency TEXT, encryption_key TEXT, bitrates TEXT, quality TEXT, signal_level TEXT)");
}
function insertWifis(db, cells) {
    let now = Math.round(new Date().getTime() / 1000);
    let stmt = db.prepare("INSERT INTO wifi (timestamp, ssid, mac, protocol, mode, frequency, encryption_key, bitrates, quality, signal_level) VALUES (?,?,?,?,?,?,?,?,?,?)");
    cells.forEach(info => {
        stmt.run(now, info.ssid, info.mac, info.procotol, info.mode, info.frequency, info.encryption_key, info.bitrates, info.quality, info.signal_level);
    });
    stmt.finalize();  
}
function getWifis(db) {
    db.each("SELECT id, timestamp, ssid, mac FROM wifi", function(err, row) {
        console.log(row.id + ": " + row.timestamp + ", " + row.ssid + ", " + row.mac);
    });  
}
function closeDb(db) {
    db.close();
}

module.exports = {
    scanWifiNetworksAndInsert,
    getWifisFromDb
};