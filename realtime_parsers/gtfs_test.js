var GtfsRealtimeBindings = require('gtfs-realtime-bindings');
var request = require('request');

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
  if(err){
      throw err;
  }
  console.log('MySQL is loaded!')
})






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




let scheduleFinder = (stop_number) => {
  console.time('func1')
  return new Promise(resolve =>{

  

  read_gtfs('https://drtonline.durhamregiontransit.com/gtfsrealtime/TripUpdates').then(result => {
    
    //This is the successful resolve
    let resolveData = {}

    db.query(`SELECT * FROM stops WHERE stop_id = '${stop_number}'`, (err,res)=>{
        //Invalid stop: (resolve -> null)
        if(JSON.stringify(res) == '[]'){
          console.log("Invalid Stop...")
          resolve(null)
        }
      
        resolveData = {
          stop_id : stop_number,
          stop_name : res[0].stop_name,
          wheelchair_access: false,
          trips: []
        }

        //Wheelchair access boolean:
        if (res[0].wheelchair_access == 1){
          resolveData.wheelchair_access = true;
        }


        result.entity.forEach(element => {
          let timeObject = new Date();
          //console.log(element.tripUpdate)
          //console.log(element.tripUpdate.stopTimeUpdate)
    
          element.tripUpdate.stopTimeUpdate.forEach(elm => {
            if(elm.stopId == `${stop_number}:1`){
              //console.log(element)
              //console.log(elm.arrival.time.low) //This is the path to UNIX time
                                                // of when the bus is coming for
                                                // corresponding stop_num
              //Difference Between Scheduled arrival and current time (UNIX) (seconds)

              let tripInfo = {
                route: element.tripUpdate.trip.routeId, //ID of Route corresponding to the trip (e.g route 900)
                vehicleId : element.tripUpdate.vehicle.id, //ID of vehicle that's arriving for said time going on said route
                arrivalTime : 0, //Time the bus is arriving (In Javascript Date format)
                arrivalTimeDiff : 0, //Time between when the bus is excepted to arrive, and current time (In Seconds)
                formattedTime: '', //Formatted string of arrivalTime

              }


              tripInfo.arrivalTimeDiff = (elm.arrival.time.low-(Math.floor( (timeObject.getTime()/1000)-14400 )))-14400
              tripInfo.arrivalTime = new Date(timeObject.getTime()+tripInfo.arrivalTimeDiff*1000)
              const formatTimeArray = [tripInfo.arrivalTime.getHours(),tripInfo.arrivalTime.getMinutes().toString(),""]
              //Formatter:
              
                if (formatTimeArray[0] >= 12){
                    formatTimeArray[2] = "PM"
                    formatTimeArray[0] = formatTimeArray[0]-12
                } else if(formatTimeArray[0] == 0){
                    formatTimeArray[2] = "AM"
                    formatTimeArray[0] = 12;  
                  } else {
                    formatTimeArray[2] = "AM"
                  } 
                  if(formatTimeArray[1].length == 1 ){
                    formatTimeArray[1] = '0'+formatTimeArray[1]
                  }
                
                tripInfo.formattedTime = formatTimeArray[0]+":"+formatTimeArray[1]+" "+formatTimeArray[2]

                resolveData.trips.push(tripInfo);
    
            }
          })
    
        });

      resolveData.trips.sort(function(a,b) {
          return a.arrivalTimeDiff - b.arrivalTimeDiff;
      })
    console.timeEnd('func1')
     resolve(resolveData)   
    });

    //console.log("Length:" + result.entity.length)
    



  });


});
}

scheduleFinder(2242).then(rez => {
console.log(rez)
});
