var request = require('request');
const util = require('util');
var gtfs_rt = require('./gtfs_realtime.js');
const dateLib = require('date-and-time');

const mysql = require('mysql2');
const { resolve } = require('path');
//Create MYSQL connection:

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'drt_sms_db',
    multipleStatements: true
});


const query = util.promisify(db.query).bind(db);


let stopDataFormat = async (tripData) => {
    //Sorting tripData
    if(!tripData.length){
        return "No dat"
    }
    tripData.sort((a, b) => a.arrivalTime - b.arrivalTime); //Sort into Increasing format..

    //trips Query (for headsigns)

    /*
    The trips_query object assigns a dictionary to the result of a select query (on the
    Table: trips) where trip_id is equal to all the trip_id's of the tripData.
    - tripData is mapped in function of each trip id, 
        then formatted into a MySQL array -> ('elm','elm','elm')
    - The result of the select query on the trips Table is then formatted into dictionary
        as trip_Id : trip_headsign form. 
    (Headsigns are used to differentiate different variations of the same route)
    */
    const trips_query = Object.assign({}, 
            ...(await query(`SELECT * FROM trips WHERE trip_id IN ${"('"+(tripData.map(t => t.tripId)).join(`','`)+"')"}`)) 
            .map( (x) => ({[x.trip_id]: x.trip_headsign}) ));
    
    console.log(trips_query)

    //Stop Query (for stop name & wheelchair access)
    const stopInfo = await query(`SELECT * FROM stops WHERE stop_id = ?`,[tripData[0].stopId]);
    

    //Header of string:
    let formatted = stopInfo[0].stop_name + "\n" + 'Wheelchair Access' + ( stopInfo[0].wheelchair_access ? ` Available` : ` Not Available` ) + '\n\n'
    tripData.forEach(trip => {
        //Appending each trip (formatted) -> [routeId (e.g 900) , arrivalTime (e.g 1:23 PM), arrival Time in minutes (e.g arrival in X minutes)]
        formatted += `ROUTE ${trip.routeId} - ${dateLib.format(new Date(trip.arrivalTime*1000),'hh:mm A' )}\n${trips_query[trip.tripId]}\n* Arrival in ${ Math.ceil((trip.arrivalTime - (Date.now()/1000))/60)} minute(s)\n\n`
});
    //console.log(formatted);

    return formatted
}

let dataFetch = async (stop_number, route_filter) => {
    if (route_filter != null){
        return stopDataFormat(
        await query('SELECT * FROM `realtime_gtfs` WHERE stopId = ? AND routeId = ?', [stop_number, route_filter])
        );
    } else {
        return stopDataFormat(
        await query('SELECT * FROM `realtime_gtfs` WHERE stopId = ?', [stop_number])
        )
    };
}


let gtfs_parse = async (stop_number,route_filter) => {
    
    /* A false state means that the function hasn't checked if the data is old or not 
        NOTE: the state is initally false.
    */

    const init_data = await query('SELECT * FROM `realtime_gtfs` LIMIT 1');
    const current_time = Date.now();

    if (current_time >= init_data[0].expiryTime ) {
        await gtfs_rt.db_insert_realtime();
        console.log(await dataFetch(stop_number,route_filter));

    } else {
        console.log(await dataFetch(stop_number,route_filter));
    }




   
}

console.log(gtfs_parse(1593,null));

// let gtfs_test = async () => {
//     console.time("1");
//     await gtfs_rt.db_insert_realtime();
//     console.timeEnd("1");
// }

// gtfs_test();