var GtfsRealtimeBindings = require('gtfs-realtime-bindings');
var request = require('request');

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

  
  let parsing = async () => {
    const result = await read_gtfs('https://drtonline.durhamregiontransit.com/gtfsrealtime/TripUpdates');
    const test = result.entity.slice(0,1);
    console.log(test[0].id);

};

  parsing();