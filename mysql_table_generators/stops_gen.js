//CREATE TABLE stops(stop_id MEDIUMINT UNSIGNED, stop_name VARCHAR(100), wheelchair_access TINYINT)

//Importing database pool:
const db = require('../database_pool.js');

let stops_generate = async (static_file_path) => {
    //Promisify pool
    const Promise_pool = db.promise();

    Promise_pool.execute(`TRUNCATE TABLE stops`);


    //Import Static Text file dependencies:
    const { readFile } = require('fs/promises') , stop_times = static_file_path+'/stops.txt';

    let stops_data = (await readFile(stop_times,'utf8')).split('\n').slice(1,-1);


    for(const [index,stop] of stops_data.entries()){
        //Formatting & Cleaning data from file:
        let cols = stop.split(',');
        
        //Stop ID cleaner (cols[0])
        if(cols[0].slice(cols[0].length-2) == ':1'){
            cols[0] = cols[0].slice(0,-2)
        }

        //Wheelchair Boolean
        if(cols[11] != 1){
            cols[11] = 0;
        } else{
            cols[11] = cols[11]|0;
        }
        Promise_pool.execute(`INSERT INTO stops SET stop_id = ?, stop_name = ?, wheelchair_access =?`,[cols[0],cols[2],cols[11]]);    
        console.log(`STOPS TABLE: [${index} OUT OF ${stops_data.length-1} appended in MySQL]`);
    }



    console.log("Success!")
    return
}

module.exports = {
    stops_generate
}