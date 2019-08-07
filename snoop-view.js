const sqlite3 = require('sqlite3').verbose();

function openDb() {
    return new sqlite3.Database('/home/bjowes/defcon-snooper/snoop.db');
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

function getUniqueWifis(db) {
    db.each("SELECT id, ssid, mac, frequency, encryption_key, min(timestamp) as start_ts, max(timestamp) as end_ts FROM wifi GROUP BY ssid, mac", function(err, row) {
        if (err) {
            console.error(err);
            return;
        }
        if (ssid === undefined) return;

        row.start_ts_fmt = (new Date(row.start_ts * 1000)).toISOString();
        row.end_ts_fmt = (new Date(row.end_ts * 1000)).toISOString();
        let out = row.id + ": ";
        out += row.start_ts_fmt + " - " + row.end_ts_fmt;
        out += ", SSID: " + (row.ssid === '' ? '[Hidden SSID]' : row.ssid);
        out += ", MAC: " + row.mac;
        out += ", encrypted: " + row.encryption_key;
        console.log(out);
    });  
}

function getWifis(db) {
    db.each("SELECT id, timestamp, ssid, mac FROM wifi", function(err, row) {
        console.log(row.id + ": " + row.timestamp + ", " + row.ssid + ", " + row.mac);
    });  
}

function closeDb(db) {
    db.close();
}

let db = openDb();
getUniqueWifis(db);
closeDb(db);