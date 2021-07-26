var GtfsRealtimeBindings = require('gtfs-realtime-bindings');
var request = require('request');

//MySQL

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
  if (err) {
    throw err;
  }
  console.log('MySQL is loaded!')
})

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



let realtime_parse = async () => {
  
  try {
    var result = await read_gtfs('https://drtonline.durhamregiontransit.com/gtfsrealtime/TripUpdates');
  } catch (err) {
    console.log(err);
  }

  console.log("Length of GTFS file: " + result.entity.length)

  console.time("sql_append_query");
  //Clears table realtime_gtfs
  await db.query('TRUNCATE TABLE realtime_gtfs');

  /*
  Appends new result.entity entries into table realtime_gtfs
  Each entry is 1 stop_time within an element in the result.entity array
  Example: All stop_times from result.entity[0] will count as 20 rows (1 for each stop time)
  */

  for (let r of result.entity) {

    for (let STU of r.tripUpdate.stopTimeUpdate) {
    /*View Specific Entity based on a StopID (DEBUG PURPOSES) 
    if(parseInt(STU.stopId.split(':')[0]) == 93137){ console.log(r) }
    */
      db.query(`INSERT INTO realtime_gtfs 
                    SET expiryTime = ? ,
                     routeId = ? ,
                     vehicleId = ? ,
                     arrivalTime = ? ,
                     stopId = ?`,
        [parseInt(Math.floor((Date.now() + 90000) / 1000)),
        parseInt(r.tripUpdate.trip ? r.tripUpdate.trip.routeId : 0),
        parseInt(r.tripUpdate.vehicle ? r.tripUpdate.vehicle.id : 0),
        parseInt(STU.arrival.time.low),
        parseInt(STU.stopId.split(':')[0])
        ], (err, res) => {
          // Do something with response of db query?
        });
    }
  }
  console.timeEnd("sql_append_query")
  console.log("Completed!")

  console.log()
};

module.exports ={
  realtime_parse
}



