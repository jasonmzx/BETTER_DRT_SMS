//This file generates the static_times table (Roughly 186k rows will be generated...)
const mysql = require('mysql2')

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'drt_sms_db',
    multipleStatements: true
  });

let static_times_generate = async (static_file_path) => {
     connection.query(`TRUNCATE TABLE static_times`,(err,res)=>{
        if(!err && res){
            console.log(res);
            console.log('Table has been truncated!')
        }
    })
    //Import MySQL database pool connection:

    //Import Static Text file dependencies:
    const { readFile } = require('fs/promises') , stop_times = static_file_path+'/stop_times.txt', trips = static_file_path+'/trips.txt';

    let trip_data = (await readFile(trips,'utf8')).split('\n').slice(1,-1);
    let stop_times_data = (await readFile(stop_times,'utf8')).split('\n').slice(1,-1);

   // let gen_query = `INSERT INTO static_times (routeId, serviceId, tripId, stopId, arrivalTime, orientation, tripHeadsign) VALUES`
  //  let gen_placeholder = []
    trip_data.forEach(async trip_line => {
        const t_array = trip_line.split(',');
        console.log('Processing line >> '+ trip_data.indexOf(trip_line)+' ...');
        stop_times_data.forEach(async st_line =>{
            const st_array = st_line.split(',');

            
            if(st_array[0] == t_array[2]){
                if(t_array[1] == 'SundaySum'){ t_array[1] = 'Sunday' } 
                else if(t_array[1] == 'SaturdaySum'){ t_array[1] = 'Saturday' }
                
                connection.query(`INSERT INTO static_times (routeId, serviceId, tripId, stopId, arrivalTime, orientation, tripHeadsign) VALUES (?,?,?,?,?,?,?)`,
                [t_array[0], t_array[1], t_array[2], st_array[3].slice(0,-2), parseInt(st_array[1].slice(0,2))*60 + parseInt(st_array[1].slice(3,5)), t_array[7], t_array[3]],
                (error,result,fields)=>{
                    if(!error && result){
                        console.log(`Successful Query [${trip_data.indexOf(trip_line)} OUT OF ${trip_data.length}]`)
                    }
                })
              //  gen_query += ` (?,?,?,?,?,?,?),`;
               // gen_placeholder.push(t_array[0], t_array[1], t_array[2], st_array[3].slice(0,-2), parseInt(st_array[1].slice(0,2))*60 + parseInt(st_array[1].slice(3,5)), t_array[7], t_array[3] );

            }
        });
    //trip_data end of for loop:
    });

    // await Promise_pool.execute(gen_query.slice(0,-1),gen_placeholder);
     console.log("COMPLETED!")

}


module.exports ={
   static_times_generate
  }

