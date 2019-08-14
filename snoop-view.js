const sqlite3 = require('sqlite3').verbose();

function openDb(filename) {
    return new sqlite3.Database('/home/bjowes/defcon-snooper/' + filename);
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

let wifis = [];

function padTo(str, len) {
    if (str.toString().length >= len) return str;
    return str + "                                                  ".substring(0, (len - str.toString().length))
}

function getUniqueWifis(db) {
    db.all("SELECT id, ssid, frequency, encryption_key, min(timestamp) as start_ts, max(timestamp) as end_ts FROM wifi GROUP BY ssid ORDER BY min(timestamp)", [], function(err, rows) {
        if (err) {
            console.error(err);
            return;
        }
        wifis = [];
        rows.forEach((row, index) => {
            if (row.ssid === undefined || row.ssid === null) return;
            let place = timestampToPlace(row.start_ts, row.end_ts);
            let wifi = {
                id: row.id,
                ssid: (row.ssid === '' ? '[Hidden SSID]' : row.ssid),
                place: place,
                start_ts: row.start_ts,
                encrypted: row.encryption_key
            };
            ssidFilters.forEach((filter, index) => {
                if (filter.filter.test(row.ssid)) {
                    if (!filter.count) {
                        wifis.push(wifi);
                    }
                    filter.count++;
                } else {
                    wifis.push(wifi);
                }
            });
        });

        wifis.sort((a,b) => {/*console.log(a); console.log(b);*/ return a.place.name.localeCompare(b.place.name) || a.ssid.localeCompare(b.ssid) } )

        wifis.forEach((wifi, index) => {
            //out += wifi.start_ts_fmt + " - " + wifi.end_ts_fmt;
    
            // TODO: All tid i databasen behöver justeras med +18.5 timmar
            // strange offset
            //wifi.start_ts_offset = adjustHours(new Date(wifi.start_ts * 1000), 24);
            //wifi.end_ts_offset = adjustHours(new Date(wifi.end_ts * 1000), 24);
    
            //wifi.start_ts_fmt = adjustHours(wifi.start_ts_offset, place.time_corr).toISOString();
            //wifi.end_ts_fmt = adjustHours(wifi.end_ts_offset, place.time_corr).toISOString();
    
            //out += wifi.start_ts_fmt + ' ' + place.timezone + ' '; 
            let out = padTo(wifi.id, 8);
            out += padTo(wifi.place.name, 12);
            out += padTo(wifi.start_ts, 12);
            out += " SSID: " + padTo((wifi.ssid === '' ? '[Hidden SSID]' : wifi.ssid), 32);
            out += " encryption: " + wifi.encrypted;
            console.log(out);
        });
        console.log('after')
    });  
}

function getWifisByAccessPoint(db) {
    db.all("SELECT id, ssid, count(mac) as access_points, frequency, encryption_key, min(timestamp) as start_ts, max(timestamp) as end_ts FROM wifi GROUP BY ssid ORDER BY min(timestamp)", [], function(err, rows) {
        if (err) {
            console.error(err);
            return;
        }
        wifis = [];
        rows.forEach((row, index) => {
            if (row.ssid === undefined || row.ssid === null) return;
            let place = timestampToPlace(row.start_ts, row.end_ts);
            let wifi = {
                id: row.id,
                ssid: (row.ssid === '' ? '[Hidden SSID]' : row.ssid),
                place: place,
                start_ts: row.start_ts,
                access_points: row.access_points,
                encrypted: row.encryption_key
            };
            wifis.push(wifi);
        });

        wifis.sort((a,b) => { return a.access_points - b.access_points} )

        wifis.forEach((wifi, index) => {
            let out = wifi.id + ": ";
            //out += wifi.start_ts_fmt + " - " + wifi.end_ts_fmt;
    
            // TODO: All tid i databasen behöver justeras med +18.5 timmar
            // strange offset
            //wifi.start_ts_offset = adjustHours(new Date(wifi.start_ts * 1000), 24);
            //wifi.end_ts_offset = adjustHours(new Date(wifi.end_ts * 1000), 24);
    
            //wifi.start_ts_fmt = adjustHours(wifi.start_ts_offset, place.time_corr).toISOString();
            //wifi.end_ts_fmt = adjustHours(wifi.end_ts_offset, place.time_corr).toISOString();
    
            //out += wifi.start_ts_fmt + ' ' + place.timezone + ' '; 
            out += wifi.place.name;
            out += ', ' + wifi.start_ts;
            out += ", SSID: " + (wifi.ssid === '' ? '[Hidden SSID]' : wifi.ssid);
            out += ", encryption: " + wifi.encrypted;
            out += ", Access Points: " + wifi.access_points;
            console.log(out);
        });
        console.log('after')
    });  
}

function adjustHours(ts, time_corr) {
    let hours = ts.getHours();
    ts.setHours(hours + time_corr);
    return ts;
}

function getTimestamp(year, month, day, hour) {
    return Math.round(new Date(year, month, day, hour).getTime() / 1000);
}

const places = [
    { name: 'home', start_ts: 1564875599, end_ts: 1564940868, time_corr: 0, timezone: 'CET' },
    { name: 'Los Angeles', start_ts: 1564940930, end_ts: 1565219810, time_corr: -9, timezone: 'PDT' },
    { name: 'Las Vegas', start_ts: 1565219818, end_ts: 1566108800, time_corr: -9, timezone: 'PDT' },
    { name: 'home', start_ts: 1567108800, end_ts: 1666108800, time_corr: 0, timezone: 'CET' },
];

function timestampToPlace(start_ts, end_ts) {
    for (let i = 0; i < places.length; i++) {
        if (start_ts >= places[i].start_ts && end_ts <= places[i].end_ts)  {
            return places[i]; 
        }
    }
    return { name: '** ERROR, unknown location', time_corr: 0, timezone: 'UNKNOWN' };
}

function getWifis(db) {
    db.each("SELECT id, timestamp, ssid, mac FROM wifi", function(err, row) {
        console.log(row.id + ": " + row.timestamp + ", " + row.ssid + ", " + row.mac);
    });  
}

function closeDb(db) {
    db.close();
}


let ssidFilters = [
    { filter: new RegExp(/WiFi Hotspot \d\d\d\d/), count: 0 }
];

let db = openDb('snoop_complete.db');
//getWifis(db);
getWifisByAccessPoint(db);
getUniqueWifis(db);
closeDb(db);
console.log(JSON.stringify(places));