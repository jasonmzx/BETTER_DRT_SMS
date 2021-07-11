var fs = require('fs') , filename = 'stops.txt';


fs.readFile(filename, 'utf8', function(err, data) {
    if (err) throw err;
    console.log('OK: ' + filename);
    let lines = data.split('\n');
    lines.forEach(line => {
        let imps = line.split(',');
        //0 = StopID, 1 = StopCODE, 2 = Stop_name! , 11 = wheelchair accessiciblity

        //STOP_ID cleaner:
        if (imps[0].slice(imps[0].length-2,imps[0].length) == ':1'){
            imps[0] = imps[0].slice(0,imps[0].length-2)
        };
        // Wheelchair boolean
        if(imps[11] == 1) {
           imps[11] = true
        } else {
            imps[11] = false
        }

        //
        const cleanData = {
            stop_id : imps[0],
            stop_name : imps[2],
            wheelchair_access : imps[11],

        }

        console.log(cleanData)

    });
  });