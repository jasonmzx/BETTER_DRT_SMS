var GtfsRealtimeBindings = require('gtfs-realtime-bindings');
var request = require('request');

var fs = require('fs') , filename = 'stop_times.txt';
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



let read_gtfs_txt = () => {
    fs.readFile(filename, 'utf8', function(err, data) {
        var feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(data);
        console.log(feed)
    });
    ;
}

read_gtfs_txt();