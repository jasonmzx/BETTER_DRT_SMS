var request = require('request');
var gtfs_rt = require('./gtfs_realtime.js')

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
    if (err) {
        throw err;
    }
    console.log('MySQL is loaded!');
});



let gtfs_parse = async (stop_number) => {
    db.query('SELECT * FROM `realtime_gtfs` WHERE stopId = ?', [stop_number], (err,res) =>{
        console.log(res[0].expiryTime)
        const current_time = parseInt(Math.floor((Date.now()) / 1000))
        console.log(current_time)
        if (current_time >= res[0].expiryTime ){
            gtfs_rt.realtime_parse();
        }



    })
   
}

gtfs_parse(2242);