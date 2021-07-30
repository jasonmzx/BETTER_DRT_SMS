var fs = require('fs') , filename = 'gtfs_static/trips.txt';
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'drt_sms_db',
    multipleStatements: true
  });


fs.readFile(filename, 'utf8', function(err,data) {
    const dataLines = data.split('\n');

    dataLines.forEach(line => {
        const row = line.split(',');
        console.log(row[3]);
        
        db.query('INSERT INTO trips (trip_id, trip_headsign, direction) VALUES (?,?,?)', [row[2] ,row[3], row[7]])

    });
});