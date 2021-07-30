var GtfsRealtimeBindings = require('gtfs-realtime-bindings');
var request = require('request');
const util = require('util');

//MySQL

const mysql = require('mysql2/promise');
const { truncate } = require('fs');
//Create MYSQL connection:
// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   database: 'drt_sms_db',
//   multipleStatements: true
// });

//Connect
//GTFS reader 

let read_gtfs = (data_url) => {
  return new Promise(resolve => {
    var requestSettings = {
      method: 'GET',
      url: data_url,
      encoding: null
    };

    request(requestSettings, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(body);
        resolve(feed)
      }
    });
  })

};

// const query = util.promisify(db.query).bind(db);

let db_insert_realtime = async () => {
  
  try {
    var result = await read_gtfs('https://drtonline.durhamregiontransit.com/gtfsrealtime/TripUpdates');
  } catch (err) {
    console.log(err);
  }

  console.log("Length of GTFS file: " + result.entity.length)
  //Clears table realtime_gtfs

  /*
  Appends new result.entity entries into table realtime_gtfs
  Each entry is 1 stop_time within an element in the result.entity array
  Example: All stop_times from result.entity[0] will count as 20 rows (1 for each stop time)
  */

  const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'drt_sms_db',
    multipleStatements: true
  });


  const truncate_result = await db.execute('TRUNCATE TABLE realtime_gtfs')
  console.log(truncate_result)

  console.time("sql_append_query");

  let query_values = ''

  for (let r of result.entity) {
    for (let STU of r.tripUpdate.stopTimeUpdate) {
    /*View Specific Entity based on a StopID (DEBUG PURPOSES) 
    if(parseInt(STU.stopId.split(':')[0]) == 93137){ console.log(r) }
    */
    query_values += `(${(Date.now() + 90000)} , 
                      ${(r.tripUpdate.trip ? r.tripUpdate.trip.routeId : 0)|0} , 
                      ${(r.tripUpdate.vehicle ? r.tripUpdate.vehicle.id : 0)|0} , 
                      ${STU.arrival.time.low} , 
                      ${(STU.stopId.split(':')[0])|0},
                      '${r.id}'),`
    
    }
  }
  
  query_values = query_values.slice(0,query_values.length-1)
  await db.execute(`INSERT INTO realtime_gtfs (expiryTime, routeId, vehicleId, arrivalTime, stopId, tripId) VALUES ${query_values}`);

  console.timeEnd("sql_append_query")

  console.log("Completed!")
}




//Export Functions here
module.exports ={
  db_insert_realtime
}



