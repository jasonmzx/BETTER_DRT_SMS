var fs = require('fs') , stop_times = 'gtfs_static/stop_times.txt', trips = 'gtfs_static/trips.txt';
const mysql = require('mysql');

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



fs.readFile(trips, 'utf8', function(trip_err,trip_data) {
    if(trip_err) throw trip_err

    //Remove .slice in the future
    let trip_lines = trip_data.split('\n');
    
    const stop_time_data = fs.readFileSync(stop_times, 'utf8')

    let st_lines = stop_time_data.split('\n');
    //console.log(trip_lines)


    //console.log(st_lines);
    //Trips loop
    trip_lines.forEach(t_line => {
        const t_array = t_line.split(',');
        //Stop times loop 
        st_lines.forEach(st_line =>{
            // console.log(st_lines.indexOf(st_line))
            const st_array = st_line.split(',');
            //console.log(t_array[2])
            if(st_array[0] == t_array[2]){
            //    const rowPushData = {
            //        route_id: t_array[0],
            //        service_id: t_array[1],
            //        trip_id: t_array[2],
            //        stop_id: st_array[3].slice(0,st_array[3].length-2),
            //        arrival_time: st_array[1],
            //        departure_time: st_array[2]
            //    }
               //console.log(rowPushData);
               console.log(st_lines.indexOf(st_line) + " , " + trip_lines.indexOf(t_line));
                                //Replace null with "Stop_times"
            db.query(`INSERT INTO stop_times 
                SET route_id = "${t_array[0]}", 
                service_id = "${t_array[1]}", 
                trip_id = "${t_array[2]}",
                stop_id = "${st_array[3].slice(0,st_array[3].length-2)}",
                arrival_time = "${st_array[1]}",
                departure_time = "${st_array[2]}",
                orientation = "${t_array[7]}"
                `, (p_err,p_res) =>{
                console.log(p_res);
                if(p_err) throw p_err

                });
            

            }

        });




    });

});