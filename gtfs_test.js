var GtfsRealtimeBindings = require('gtfs-realtime-bindings');
var request = require('request');

var requestSettings = {
  method: 'GET',
  url: 'https://drtonline.durhamregiontransit.com/gtfsrealtime/TripUpdates',
  encoding: null
};
console.log("even working?")
request(requestSettings, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log("This is being reached")
    var feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(body);
    console.log( 
      //JSON.parse(JSON.stringify(feed.entity))
      feed.entity[0]
      ) ;
    feed.entity.forEach(function(entity) {
      if (entity.trip_update) {
        console.log(entity.trip_update);
      }
    });
  } else {
    console.log("something isn't right")
  } 
});