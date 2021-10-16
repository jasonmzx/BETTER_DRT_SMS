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
            if(trip.vehicleId == filt_trip.vehicleId && (filt_trip.arrivalTime.toString(10)).slice(0,-3) == (trip.arrivalTime.toString(10)).slice(0,-3) ){
                //If the filter_index isn't in any other tuple (array of 2 elements):
                if( !((same_trip.filter(tuple => tuple[0] == filt_index || tuple[1] == filt_index)).length) ){
                    same_trip[index].push(filt_index);}
                return 
            }
        });
    });

    console.log('[gts_realtime_parser.js] >> Transfers have been checked.') //Server console
    return same_trip.filter(tup => tup.length);

}


let stop_data_format = async (trip_data,route_filter) => {
    //console.log(`RECIEVED: route_filter: ${route_filter}`);
    //console.log(trip_data);
    //console.log(route_filter);
    //Sorting tripData
    trip_data.sort((a, b) => a.arrivalTime - b.arrivalTime); //Sort into Increasing format.. small_num > big_num
    console.log('[gts_realtime_parser.js] >> Data sorted.') //Server console

    let trip_ref_array = transfer_check(trip_data);

    if(route_filter){

        let filtered_ref = []

        for(let i = 0; i < trip_ref_array.length;i++){
            const t = trip_ref_array[i]

            if(t.length>1){
                if(trip_data[t[0]].routeId == route_filter || trip_data[t[1]].routeId == route_filter ) {  //If either route filters match, append
                   filtered_ref.push(t)
                }
            } else {
                if(trip_data[t[0]].routeId == route_filter ){ //If routeId is the filter, append
                    filtered_ref.push(t)
                }
            }

    
        } //for loop

        trip_ref_array = filtered_ref;

    } //end of route_filter

    if(!trip_data.length){ //Callback to static
        return 'No Data Available!' 
    } 


    /*This function sorts the the trip_id element of all realtime trip_data and matches it-
      to Headsigns that corresspond to said trip_id */
    const trips_query = Object.assign({}, 
        ...(await query(`SELECT * FROM trips WHERE trip_id IN ${"('"+(trip_data.map(t => t.tripId)).join(`','`)+"')"}`)) 
        .map( (x) => ({[x.trip_id]: x.trip_headsign}) ));
    
    //Stop Query (for stop name & wheelchair access)
    const stop_info_query = await query(`SELECT * FROM stops WHERE stop_id = ?`,[trip_data[0].stopId]);

    //Header of string:
    let formatted = '>> ' + stop_info_query[0].stop_name + "\n" + 'Wheelchair Access' + ( stop_info_query[0].wheelchair_access ? ` Available` : ` Not Available` ) + '\n\n'

    


    trip_ref_array.forEach(trip_arr => {
        if((trip_data[trip_arr[0]].arrivalTime - (Date.now()/1000))/60 < 0){
            return
        }
        if(trip_arr.length == 2 && trip_data[trip_arr[0]].routeId != trip_data[trip_arr[1]].routeId){
            const trips = { first: trip_data[trip_arr[0]], second: trip_data[trip_arr[1]] }
            formatted += 'ROUTE TRANSFER ('+ trips.first.routeId+' - '+trips.second.routeId+') '+
            '\n> '+trips_query[trips.first.tripId] + ' <-> ' + trips_query[trips.second.tripId]
            //
            + ( Math.round((trip_data[trip_arr[0]].arrivalTime - (Date.now()/1000))/60) ? ('\n* Arrival in ' + Math.round((trip_data[trip_arr[0]].arrivalTime - (Date.now()/1000))/60)+' minute(s) \n@') : '\n* Bus has arrived. \n@' )
           + date_lib.format(new Date(trips.first.arrivalTime*1000),'h:mm A' )+ '\n\n' //Time it's coming (HH:MM)
        } else if(trip_arr.length == 2){
            formatted += 'ROUTE '+trip_data[trip_arr[0]].routeId+' (TRANSFER) \n'+trips_query[trip_data[trip_arr[0]].tripId]+' <-> '+trips_query[trip_data[trip_arr[1]].tripId]
            + ( Math.round((trip_data[trip_arr[0]].arrivalTime - (Date.now()/1000))/60) ? ('\n* Arrival in ' + Math.round((trip_data[trip_arr[0]].arrivalTime - (Date.now()/1000))/60)+' minute(s) \n@') : '\n* Bus has arrived. \n@' )
            + date_lib.format(new Date(trip_data[trip_arr[0]].arrivalTime*1000),'h:mm A' ) + '\n\n'
        }

         else {
            formatted += 'ROUTE '+trip_data[trip_arr[0]].routeId+' '+trips_query[trip_data[trip_arr[0]].tripId]
            // +'\n* Arrival in '+ Math.round((trip_data[trip_arr[0]].arrivalTime - (Date.now()/1000))/60) +' minute(s) @ ' + date_lib.format(new Date(trip_data[trip_arr[0]].arrivalTime*1000),'h:mm A' ) + '\n\n'
            + ( Math.round((trip_data[trip_arr[0]].arrivalTime - (Date.now()/1000))/60) ? ('\n* Arrival in ' + Math.round((trip_data[trip_arr[0]].arrivalTime - (Date.now()/1000))/60)+' minute(s) \n@') : '\n* Bus has arrived. \n@' )
            + date_lib.format(new Date(trip_data[trip_arr[0]].arrivalTime*1000),'h:mm A' ) + '\n\n'
        }
    });

    console.log('[gts_realtime_parser.js] >> Formatting complete. Callback to Express Server!')
    return formatted
}



let gtfs_parse = async (stop_number,route_filter) => {
    
    /* A false state means that the function hasn't checked if the data is old or not 
        NOTE: the state is initally false.
    */

    const init_data = await query('SELECT * FROM `realtime_gtfs` LIMIT 1');
    const current_time = Date.now();

    if (!(init_data.length) || current_time >= init_data[0].expiryTime) {
        await gtfs_rt.db_insert_realtime();
        return stop_data_format(
                await query('SELECT * FROM `realtime_gtfs` WHERE stopId = ?', [stop_number]), 
                route_filter
            )

    } else {
        return stop_data_format(
                await query('SELECT * FROM `realtime_gtfs` WHERE stopId = ?', [stop_number]), 
                route_filter
            )
    }




   
}

module.exports = {
    gtfs_parse
}
