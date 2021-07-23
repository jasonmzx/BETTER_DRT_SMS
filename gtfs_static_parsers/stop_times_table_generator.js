var fs = require('fs') , stop_times = 'gtfs_static/stop_times.txt', trips = 'gtfs_static/trips.txt';
const mysql = require('mysql');

//Database Login Info:
var DBlogin = JSON.parse(fs.readFileSync('private/db_info.json', 'utf8'));

const db = mysql.createConnection({
    host: 'localhost',
    user: DBlogin.user,
    password: DBlogin.password,
    database: DBlogin.database,
    multipleStatements: true
});

//Connect
db.connect((err) => {
    if(err){
        throw err;
    }
    console.log('MySQL is loaded!')
    console.log(DBlogin)
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
            
                if(t_array[1] == 'SundaySum'){
                    t_array[1] = 'Sunday'
                    console.log('Changed! SUN')
                } else if(t_array[1] == 'SaturdaySum'){
                    t_array[1] = 'Saturday'
                    console.log('Changed! SAT')
                };
  

               console.log(st_lines.indexOf(st_line) + " , " + trip_lines.indexOf(t_line));
                                //Replace null with "Stop_times"
            db.query(`INSERT INTO null 
                SET route_id = "${t_array[0]}", 
                service_id = "${t_array[1]}", 
                trip_id = "${t_array[2]}",
                stop_id = "${st_array[3].slice(0,st_array[3].length-2)}",
                arrival_time = "${parseInt(st_array[1].slice(0,2))*60 + parseInt(st_array[1].slice(3,5))}",
                departure_time = "${parseInt(st_array[2].slice(0,2))*60 + parseInt(st_array[2].slice(3,5))}",
                orientation = "${t_array[7]}"
                `, (p_err,p_res) =>{
                console.log(p_res);
                if(p_err) throw p_err

                });
            

            }

        });




    });

});