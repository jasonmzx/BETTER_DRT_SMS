var request = require('request');
const util = require('util');
var gtfs_rt = require('./gtfs_realtime.js'); //Local file
const date_lib = require('date-and-time');

const { resolve } = require('path');

//Import local Database Pool:
const db = require('../database_pool.js')
//Binding query to promise (Creating a db.promise() object would be valid aswell )
const query = util.promisify(db.query).bind(db);

//Transfer Checker:
let transfer_check = (trip_data) => {
    let same_trip = []

    trip_data.forEach((trip,index) => {
        same_trip.push([])
        //Basically a filter function:  
        trip_data.forEach((filt_trip,filt_index) => {
            if(trip.vehicleId == filt_trip.vehicleId){
                //If the filter_index isn't in any other tuple (array of 2 elements):
                if( !((same_trip.filter(tuple => tuple[0] == filt_index || tuple[1] == filt_index)).length) ){
                    same_trip[index].push(filt_index);}
                return 
            }
        });
    });

    return same_trip.filter(tup => tup.length);

}


let stop_data_format = async (trip_data,route_filter) => {
    //Sorting tripData
    trip_data.sort((a, b) => a.arrivalTime - b.arrivalTime); //Sort into Increasing format..

    let trip_ref_array = transfer_check(trip_data);

    if( !(trip_ref_array.some(t => t.length>1)) ){
        trip_data = trip_data.filter(trip => trip.routeId == route_filter);
        trip_ref_array = transfer_check(trip_data);
    }

    if(!trip_data.length){ //Callback to static
        return 'No Data Available!' 
    } 

    console.log(trip_ref_array);

    /*This function sorts the the trip_id element of all realtime trip_data and matches it-
      to Headsigns that corresspond to said trip_id */
    const trips_query = Object.assign({}, 
        ...(await query(`SELECT * FROM trips WHERE trip_id IN ${"('"+(trip_data.map(t => t.tripId)).join(`','`)+"')"}`)) 
        .map( (x) => ({[x.trip_id]: x.trip_headsign}) ));
    
    //Stop Query (for stop name & wheelchair access)
    const stop_info_query = await query(`SELECT * FROM stops WHERE stop_id = ?`,[trip_data[0].stopId]);

    //Header of string:
    let formatted = stop_info_query[0].stop_name + "\n" + 'Wheelchair Access' + ( stop_info_query[0].wheelchair_access ? ` Available` : ` Not Available` ) + '\n\n'

    trip_ref_array.forEach(trip_arr => {
        if(trip_arr.length == 2){
            const trips = { first: trip_data[trip_arr[0]], second: trip_data[trip_arr[1]] }
            formatted += 'ROUTE TRANSFER ('+ trips.first.routeId+' - '+trips.second.routeId+') '+
            '\n> '+trips_query[trips.first.tripId] + ' - ' + trips_query[trips.second.tripId]
            +'\n* Arrival in '+ Math.round((trips.first.arrivalTime - (Date.now()/1000))/60)+' minute(s) @ '+ date_lib.format(new Date(trips.first.arrivalTime*1000),'h:mm A' )+ '\n\n'
        } else {
            formatted += 'ROUTE '+trip_data[trip_arr[0]].routeId+' > '+trips_query[trip_data[trip_arr[0]].tripId]
            +'\n* Arrival in '+ Math.round((trip_data[trip_arr[0]].arrivalTime - (Date.now()/1000))/60) +' minute(s) @ ' + date_lib.format(new Date(trip_data[trip_arr[0]].arrivalTime*1000),'h:mm A' ) + '\n\n'
        }
    });

    return formatted
}

//This data fetch function will be removed:
let data_fetch = async (stop_number, route_filter) => {
        return stop_data_format(
        await query('SELECT * FROM `realtime_gtfs` WHERE stopId = ?', [stop_number]) , route_filter
        )
 
}


let gtfs_parse = async (stop_number,route_filter) => {
    
    /* A false state means that the function hasn't checked if the data is old or not 
        NOTE: the state is initally false.
    */

    const init_data = await query('SELECT * FROM `realtime_gtfs` LIMIT 1');
    const current_time = Date.now();

    if (current_time >= init_data[0].expiryTime ) {
        await gtfs_rt.db_insert_realtime();
        console.log(await data_fetch(stop_number,route_filter)); //Remove these too
        return stop_data_format(
            await query('SELECT * FROM `realtime_gtfs` WHERE stopId = ?', [stop_number]) , route_filter
            )

    } else {
        console.log(await data_fetch(stop_number,route_filter)); //Remove these too
        return stop_data_format(
            await query('SELECT * FROM `realtime_gtfs` WHERE stopId = ?', [stop_number]) , route_filter
            )
    }




   
}

console.log(gtfs_parse(1593,900));

// let gtfs_test = async () => {
//     console.time("1");
//     await gtfs_rt.db_insert_realtime();
//     console.timeEnd("1");
// }

// gtfs_test();