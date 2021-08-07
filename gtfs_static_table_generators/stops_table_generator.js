//CREATE TABLE static_times(routeId SMALLINT UNSIGNED, serviceId VARCHAR(20), tripId VARCHAR(70), stopId MEDIUMINT UNSIGNED, arrivalTime INT UNSIGNED, orientation VARCHAR(70), tripHeadsign VARCHAR(80));


var fs = require('fs') , filename = 'stops.txt';
const mysql = require('mysql');
//Create MYSQL connection:
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'drt_sms_db',
    multipleStatements: true
});

//Connect
db.connect((err) => {
    if(err){
        throw err;
    }
    console.log('MySQL is loaded!')
})

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
           imps[11] = 1 //TRUE
        } else {
            imps[11] = 0  //False
        }

        //
        const cleanData = {
            stop_id : imps[0],
            stop_name : imps[2],
            wheelchair_access : imps[11],

        }
                                    //Replace NULL__ with stops 
        db.query(`INSERT INTO NULL__  
                    SET stop_id = '${cleanData.stop_id}', 
                    stop_name = "${cleanData.stop_name}", 
                    wheelchair_access = ${cleanData.wheelchair_access} `, (err,res) =>{
            console.log(cleanData)
            
            if(err) throw err

        });


    });
  });