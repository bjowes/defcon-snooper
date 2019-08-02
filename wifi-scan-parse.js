var stdin = process.stdin,
    stdout = process.stdout,
    inputChunks = [];

stdin.resume();
stdin.setEncoding('utf8');

stdin.on('data', function (chunk) {
    inputChunks.push(chunk);
});

stdin.on('end', function () {
    let res = iwlistParse(inputChunks.join());
    stdout.write(JSON.stringify(res));
    stdout.write('\n');
});

function iwlistParse(str) {
    var out = str.replace(/^\s+/mg, '');
    out = out.split('\n');
    var cells = [];
    var line;
    var info = {};
    var fields = {
        'mac' : /^Cell \d+ - Address: (.*)/,
        'ssid' : /^ESSID:"(.*)"/,
        'protocol' : /^Protocol:(.*)/,
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
            if (mac in info) {
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
 