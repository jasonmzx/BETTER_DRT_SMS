const trip_data = [
    {
      expiryTime: 1628092043510,
      routeId: 224,
      vehicleId: 6116,
      arrivalTime: 1628092311,
      stopId: 93137,
      tripId: '1373__12014_Timetable_-_2021-06'
    },
      {
      vehicleId: 420,
      arrivalTime: 5000,
  },
    {
      expiryTime: 1628092043512,
      routeId: 216,
      vehicleId: 6116,
      arrivalTime: 1628092311,
      stopId: 93137,
      tripId: '1387__12014_Timetable_-_2021-06'
    },
    {
      expiryTime: 1628092043512,
      routeId: 216,
      vehicleId: 6103,
      arrivalTime: 1628094720,
      stopId: 93137,
      tripId: '1258__12017_Timetable_-_2021-06'
    },
    {
      expiryTime: 1628092043512,
      routeId: 224,
      vehicleId: 6103,
      arrivalTime: 1628094720,
      stopId: 93137,
      tripId: '1389__12017_Timetable_-_2021-06'
    },
    {
      expiryTime: 1628092043512,
      routeId: 224,
      vehicleId: 62103,
      arrivalTime: 1628234094720,
      stopId: 93137,
      tripId: '1389__12017_Timetable_-_2021-06'
    }
  ]
  

let same_trip = []

//For each element in trip Data
trip_data.forEach((trip,index) => {
    //Push a new array in same_trip:
    same_trip.push([])
    //Filter each element to itself (Using element, and it's index) 
    trip_data.forEach((filt_trip,filt_index) => {
       //If elements match:
        if(trip.vehicleId == filt_trip.vehicleId && trip.arrivalTime == filt_trip.arrivalTime){
            //If the filter_index isn't in any other tuple (array of 2 elements):
            if( !((same_trip.filter(tuple => tuple[0] == filt_index || tuple[1] == filt_index)).length) ){
                //Push into same_trip array in function of the main loop's index
                same_trip[index].push(filt_index);
            }
            return 
        }
    });
});

same_trip = same_trip.filter(tup => tup.length );

console.log(same_trip)