var GtfsRealtimeBindings = require('gtfs-realtime-bindings');
var request = require('request');

var requestSettings = {
  method: 'GET',
  url: 'https://drtonline.durhamregiontransit.com/gtfsrealtime/TripUpdates',
  encoding: null
};
console.log("even working?")


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

  read_gtfs('https://drtonline.durhamregiontransit.com/gtfsrealtime/TripUpdates').then(result => {

    console.log("Length:" + result.entity.length)
    
    result.entity.forEach(element => {
      let timeObject = new Date();
      //console.log(element.tripUpdate)
      //console.log(element.tripUpdate.stopTimeUpdate)
      element.tripUpdate.stopTimeUpdate.forEach(elm => {
        if(elm.stopId == `${stop_number}:1`){
          console.log(element)
          console.log(elm.arrival.time.low) //This is the path to UNIX time
                                            // of when the bus is coming for
                                            // corresponding stop_num
          //Difference Between Scheduled arrival and current time (UNIX) (seconds)
          const timeDifference = (elm.arrival.time.low-(Math.floor( (timeObject.getTime()/1000)-14400 )))-14400
          console.log(timeDifference)
          const arrivalTime = new Date(timeObject.getTime()+timeDifference*1000)
          const formatTimeArray = [arrivalTime.getHours(),arrivalTime.getMinutes(),""]
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
            
     

          console.log(formatTimeArray[0]+":"+formatTimeArray[1]+" "+formatTimeArray[2] )
        }
      })

    });
  });

}

scheduleFinder(2242)