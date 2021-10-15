const date_lib = require('date-and-time');

const rows = [
    {
      expiryTime: 1634325198024,
      routeId: 915,
      vehicleId: 6116,
      arrivalTime: 1634322631,
      stopId: 2569,
      tripId: '2492__12902_Timetable_-_2021-10'
    },
   {
      expiryTime: 1634325198019,
      routeId: 915,
      vehicleId: 8454,
      arrivalTime: 1634325305,
      stopId: 2569,
      tripId: '2629__12914_Timetable_-_2021-10'
    },
     {
      expiryTime: 1634325198023,
      routeId: 915,
      vehicleId: 8454,
      arrivalTime: 1634325335,
      stopId: 2569,
      tripId: '2605__12914_Timetable_-_2021-10'
    },
     {
      expiryTime: 1634325198024,
      routeId: 890,
      vehicleId: 6109,
      arrivalTime: 1634325527,
      stopId: 2569,
      tripId: '5265__12039_Timetable_-_2021-10'
    },
   {
      expiryTime: 1634325198019,
      routeId: 890,
      vehicleId: 6109,
      arrivalTime: 1634325600,
      stopId: 2569,
      tripId: '5270__12039_Timetable_-_2021-10'
    },
    {
      expiryTime: 1634325198016,
      routeId: 224,
      vehicleId: 8452,
      arrivalTime: 1634325677,
      stopId: 2569,
      tripId: '1174__12026_Timetable_-_2021-10'
    },
  {
      expiryTime: 1634325198015,
      routeId: 216,
      vehicleId: 8528,
      arrivalTime: 1634325875,
      stopId: 2569,
      tripId: '1230__12027_Timetable_-_2021-10'
    },
    {
      expiryTime: 1634325198019,
      routeId: 915,
      vehicleId: 8621,
      arrivalTime: 1634326145,
      stopId: 2569,
      tripId: '2587__12905_Timetable_-_2021-10'
    },
    {
      expiryTime: 1634325198015,
      routeId: 917,
      vehicleId: 8527,
      arrivalTime: 1634326181,
      stopId: 2569,
      tripId: '2891__12038_Timetable_-_2021-10'
    },
    {
      expiryTime: 1634325198015,
      routeId: 216,
      vehicleId: 8452,
      arrivalTime: 1634326200,
      stopId: 2569,
      tripId: '1315__12026_Timetable_-_2021-10'
    },
    {
      expiryTime: 1634325198022,
      routeId: 224,
      vehicleId: 8528,
      arrivalTime: 1634326200,
      stopId: 2569,
      tripId: '1377__12027_Timetable_-_2021-10'
    },
     {
      expiryTime: 1634325198023,
      routeId: 915,
      vehicleId: 8621,
      arrivalTime: 1634326200,
      stopId: 2569,
      tripId: '2395__12905_Timetable_-_2021-10'
    },
     {
      expiryTime: 1634325198023,
      routeId: 917,
      vehicleId: 8511,
      arrivalTime: 1634326560,
      stopId: 2569,
      tripId: '2894__12036_Timetable_-_2021-10'
    },
    {
      expiryTime: 1634325198016,
      routeId: 890,
      vehicleId: 6109,
      arrivalTime: 1634327280,
      stopId: 2569,
      tripId: '5264__12039_Timetable_-_2021-10'
    },
    {
      expiryTime: 1634325198019,
      routeId: 890,
      vehicleId: 6109,
      arrivalTime: 1634327400,
      stopId: 2569,
      tripId: '5269__12039_Timetable_-_2021-10'
    },
     {
      expiryTime: 1634325198019,
      routeId: 915,
      vehicleId: 8623,
      arrivalTime: 1634327404,
      stopId: 2569,
      tripId: '2534__12912_Timetable_-_2021-10'
    },
    {
      expiryTime: 1634325198023,
      routeId: 915,
      vehicleId: 8623,
      arrivalTime: 1634327434,
      stopId: 2569,
      tripId: '2595__12912_Timetable_-_2021-10'
    },
     {
      expiryTime: 1634325198016,
      routeId: 224,
      vehicleId: 8526,
      arrivalTime: 1634327523,
      stopId: 2569,
      tripId: '1167__12032_Timetable_-_2021-10'
    },
   {
      expiryTime: 1634325198022,
      routeId: 915,
      vehicleId: 6116,
      arrivalTime: 1634327700,
      stopId: 2569,
      tripId: '2493__12902_Timetable_-_2021-10'
    },
  {
      expiryTime: 1634325198023,
      routeId: 216,
      vehicleId: 6110,
      arrivalTime: 1634327829,
      stopId: 2569,
      tripId: '1317__12029_Timetable_-_2021-10'
    },
    {
      expiryTime: 1634325198016,
      routeId: 917,
      vehicleId: 8575,
      arrivalTime: 1634327880,
      stopId: 2569,
      tripId: '2931__3115_Timetable_-_2021-10'
    },
   {
      expiryTime: 1634325198015,
      routeId: 216,
      vehicleId: 8526,
      arrivalTime: 1634328000,
      stopId: 2569,
      tripId: '1269__12032_Timetable_-_2021-10'
    },
    {
      expiryTime: 1634325198022,
      routeId: 224,
      vehicleId: 6110,
      arrivalTime: 1634328000,
      stopId: 2569,
      tripId: '1303__12029_Timetable_-_2021-10'
    },
    {
      expiryTime: 1634325198023,
      routeId: 915,
      vehicleId: 6116,
      arrivalTime: 1634328000,
      stopId: 2569,
      tripId: '2437__12902_Timetable_-_2021-10'
    },
    {
      expiryTime: 1634325198023,
      routeId: 917,
      vehicleId: 8527,
      arrivalTime: 1634328360,
      stopId: 2569,
      tripId: '2966__12038_Timetable_-_2021-10'
    },
    {
      expiryTime: 1634325198022,
      routeId: 915,
      vehicleId: 8624,
      arrivalTime: 1634328600,
      stopId: 2569,
      tripId: '2503__12911_Timetable_-_2021-10'
    }
  ]
// [ 10, 11, 21, 23 
const iter_spots = [1,2]

for(var iter of iter_spots){
    console.log(rows[iter]);
    console.log(date_lib.format(new Date(rows[iter].arrivalTime*1000),'h:mm A'));
}

// [
//     [ 0, 18, 23 ],    [ 1, 2 ],
//     [ 3, 4, 13, 14 ], [ 13, 14 ],
//     [ 5, 9 ],         [ 6, 10 ],
//     [ 7, 11 ],        [ 8, 24 ],
//     [ 12 ],           [ 15, 16 ],
//     [ 17, 21 ],       [ 23 ],
//     [ 19, 22 ],       [ 20 ],
//     [ 25 ]
//   ]