var GtfsRealtimeBindings = require('gtfs-realtime-bindings');
var request = require('request');

//Importing local files:
const mysql = require('../database_pool.js')



//This function is used to fetch the GTFS Realtime data, and decode it using the gtfs-realtime-bindings library.
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


let db_insert_realtime = async () => {
  
  try {
    var result = await read_gtfs('https://drtonline.durhamregiontransit.com/gtfsrealtime/TripUpdates');
  } catch (err) {
    console.log(err);
  }
  
  const db = mysql.promise();

  const truncate_result = await db.execute('TRUNCATE TABLE realtime_gtfs')

  console.log("[gtfs_realtime.js] >> " + (truncate_result ? "TRUNCATED realtime_gtfs TABLE" : "*ERROR* TRUNCATING realtime_gtfs TABLE"));

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

  console.log("[gtfs_realtime.js] >> "+" realtime_gtfs TABLE QUERY Completed! \n")
}


//Export Functions here
module.exports ={
  db_insert_realtime
}



