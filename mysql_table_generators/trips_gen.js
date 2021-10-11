//CREATE TABLE trips(trip_id VARCHAR(120), trip_headsign VARCHAR(150),direction VARCHAR(70))

//Importing database pool:
const db = require('../database_pool.js');

let trips_generate = async (static_file_path) => {
    //Promisify pool
    const Promise_pool = db.promise();

    Promise_pool.execute(`TRUNCATE TABLE trips`);


    //Import Static Text file dependencies:
    const { readFile } = require('fs').promises , trips = static_file_path+'/trips.txt';

    let trips_data = (await readFile(trips,'utf8')).split('\n').slice(1,-1);


    for(const [index,stop] of trips_data.entries()){
        //Formatting & Cleaning data from file:
        let cols = stop.split(',');
        
        Promise_pool.execute('INSERT INTO trips (trip_id, trip_headsign, direction) VALUES (?,?,?)',
        [cols[2],cols[3],cols[7]]);    
        console.log(`TRIPS TABLE: [${index} OUT OF ${trips_data.length-1} appended in MySQL]`);
    }



    console.log("Success!")
    return
}

module.exports = {
    trips_generate
}