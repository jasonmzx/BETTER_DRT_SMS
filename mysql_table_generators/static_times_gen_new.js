const db = require('../database_pool.js');


let generate_chunk = async (trip_line, s_t_filt,Promise_pool)=>{

        for(let s_t_index of s_t_filt){
            const static_line = s_t_index.split(',');
            try{
            Promise_pool.execute(`INSERT INTO static_times (routeId, serviceId, tripId, stopId, arrivalTime, orientation, tripHeadsign) VALUES (?,?,?,?,?,?,?)`,
            [
                trip_line[0],
                trip_line[1],
                trip_line[2],
                static_line[3].slice(0,-2),
                parseInt(static_line[1].slice(0,2))*60 + parseInt(static_line[1].slice(3,5)),
                trip_line[7],
                trip_line[3]
            ]);
            } catch (err) {
                console.log("Timeout error occured");

            }
        }

}


let static_times_generate = async (static_file_path) => {
    //Promisify db query
    const Promise_pool = db.promise();
    //Truncate Static Times table
    Promise_pool.execute(`TRUNCATE TABLE static_times`);

    const { readFile } = require('fs').promises , stop_times = static_file_path+'/stop_times.txt', trips = static_file_path+'/trips.txt';
    
    let trip_data = (await readFile(trips,'utf8')).split('\n').slice(1,-1);
    let stop_times_data = (await readFile(stop_times,'utf8')).split('\n').slice(1,-1);

    for(let trip of trip_data){
        const trip_line = trip.split(','); //trip_line[2] is corresponding timetable to stop times data
        const s_t_filt = stop_times_data.filter(st_line => st_line.split(',')[0] == trip_line[2]);

        console.log(trip);

        if(trip_line[1] == 'SundaySum'){ trip_line[1] = 'Sunday' } 
        else if(trip_line[1] == 'SaturdaySum'){ trip_line[1] = 'Saturday' }

        await generate_chunk(trip_line,s_t_filt,Promise_pool);

    }
    

    console.log('Success')





} 

module.exports = {
    static_times_generate
}