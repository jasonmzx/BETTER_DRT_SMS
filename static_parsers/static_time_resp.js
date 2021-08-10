const date_lib = require('date-and-time');

//Local database file
const db = require('../database_pool.js')


let daw_classif = (daw_today,daw_tmrw) => {
    const daw_arr = []
    if (['Monday','Tuesday','Wednesday','Thursday','Friday'].includes(daw_today) == true ){
        daw_arr.push('Weekday')}   else {daw_arr.push(daw_today)};
    if (['Monday','Tuesday','Wednesday','Thursday','Friday'].includes(daw_tmrw) == true ){
        daw_arr.push('Weekday')}   else {daw_arr.push(daw_tmrw)};
    return daw_arr 
};

//(Static Version) Transfer Checker:
let transfer_check = (trip_data) => {
    let same_trip = []

    trip_data.forEach((trip,index) => {
        same_trip.push([])
        //Basically a filter function:  
        trip_data.forEach((filt_trip,filt_index) => {
            if(trip.serviceId === filt_trip.serviceId 
                && trip.arrivalTime === filt_trip.arrivalTime 
                && trip.tripId.slice(5,10) === filt_trip.tripId.slice(5,10))
              {
                //If the filter_index isn't in any other tuple (array of 2 elements):
                if( !((same_trip.filter(tuple => tuple[0] == filt_index || tuple[1] == filt_index)).length) ){
                    same_trip[index].push(filt_index);}
                return 
            }
        });
    });

    return same_trip.filter(tup => tup.length);

}

// Route pattern Sorter:
let route_pattern_sort = (trip_ref_arr , trip_query) => {
    let formattedData = {'transfers':[]}

    const orientation_shorten = (o) => {
        switch (o) {
            case 'Westbound':
                return '- WB';
            case 'Eastbound':
                return '- EB';
            case 'Northbound':
                return '- NB';
            case 'Southbound':
                return '- SB';
            default:
                return '';
        }
    }

    trip_ref_arr.forEach( (trip,index) => {
        if(trip.length > 1){
            formattedData['transfers'].push(trip); 
        } else {
            const route_class = `${trip_query[trip[0]].routeId} ${trip_query[trip[0]].tripHeadsign} ${orientation_shorten(trip_query[trip[0]].orientation)}`

            if(trip.length > 1){
                formattedData['transfers'].push(trip); 
            }

            if(Object.keys(formattedData).includes(route_class) == false ){
                formattedData[route_class] = [];              
            }

            formattedData[route_class].push(trip);
        }
    });
    return formattedData;
}

// Static Route data formatter:
let static_data_format = async (trip_ref_obj, static_query_split,stop_number) => {

    const Promise_pool = db.promise();

    let max_visible = 5
    let formatted_obj = {}

    //Create formatted_obj with all the route_key's from today.
    Object.keys(trip_ref_obj.today).splice(1).forEach(route_key => {
        if(!(Object.keys(formatted_obj).includes(route_key))){
            formatted_obj[route_key] = []
        }
        //Push today's trips
        //trip_ref_obj.today[route_key].forEach( (trip,trip_index) => {
        for(const [trip_index,trip] of (trip_ref_obj.today[route_key]).entries() ) {
            //Make sure the amount of trips in every key is the same as max_visible (This is done so the user isn't flooded with info)
            if( formatted_obj[route_key].length < max_visible ){
                console.log(trip_ref_obj.today[route_key][trip_index]);

                formatted_obj[route_key].push({
                    arrivalTime: static_query_split.today[trip_ref_obj.today[route_key][trip_index]].arrivalTime, //Arrival Time
                    day: 'today',
                    format_break: 0
                    //tripHeadsign: static_query_split.today[trip_ref_obj.today[route_key][trip_index]].tripHeadsign, //Trip Headsign
                    //orientation: orientation_shorten(static_query_split.today[trip_ref_obj.today[route_key][trip_index]].orientation), //Orientation (if it's direction bound)

                })
            } else { break }
        };

    });

    //Tomorrow's pushes:
    for (const route_key of Object.keys(formatted_obj)){
        if(trip_ref_obj.tmrw[route_key] && formatted_obj[route_key].length < max_visible){
            for(const [trip_index,trip] of (trip_ref_obj.tmrw[route_key]).entries() ){
                //console.log(trip_index);
                if( formatted_obj[route_key].length < max_visible ){
                formatted_obj[route_key].push(
                    {
                        arrivalTime: static_query_split.tmrw[trip_ref_obj.tmrw[route_key][trip_index]].arrivalTime, //Arrival Time
                        day: 'tmrw',
                        format_break: formatted_obj[route_key][formatted_obj[route_key].length-1].day == 'today' ? 1 : 0 //This allows the String generater to know when there is a new line
                        //tripHeadsign: static_query_split.tmrw[trip_ref_obj.tmrw[route_key][trip_index]].tripHeadsign, //Trip Headsign
                        //orientation: orientation_shorten(static_query_split.tmrw[trip_ref_obj.tmrw[route_key][trip_index]].orientation), //Orientation (if it's direction bound)
                    })
                }
            }        
        }
    }




    if( trip_ref_obj.today.transfers.length /*|| trip_ref.tmrw.transfers*/ ){
        formatted_obj['transfers'] = [];
        console.log(static_query_split.today[trip_ref_obj.today.transfers[0][0]]);
        for(let i = 0; i < max_visible; i++){
            if(i == trip_ref_obj.today.transfers.length) { break }
            formatted_obj['transfers'].push({
                route_transfer: static_query_split.today[trip_ref_obj.today.transfers[i][0]].routeId +" - "+static_query_split.today[trip_ref_obj.today.transfers[i][1]].routeId,
                tripHeadsign: static_query_split.today[trip_ref_obj.today.transfers[i][0]].arrivalTime 
            });    
        }    
    }

    console.log(formatted_obj);

    //Stop Query (for stop name & wheelchair access)
    const stop_info_query = await Promise_pool.query(`SELECT * FROM stops WHERE stop_id = ?`,[stop_number]);
    //console.log(stop_info_query[0][0].stop_id);

    let formatted = stop_info_query[0][0].stop_name + '\n' + 'Wheelchair Access' + ( stop_info_query[0][0].wheelchair_access ? ` Available` : ` Not Available`) + '\n' + '* SCHEDULED DATA *'+'\n\n';

    Object.keys(formatted_obj).forEach(route_key => {

        formatted += route_key + '\n'
        console.log(route_key);

        formatted_obj[route_key].forEach(trip => {
            if(!trip.format_break){
                formatted += '- '+date_lib.format(new Date(trip.arrivalTime*60000+1.8e+7),'h:mm A' )+'\n'
            } else{
                formatted += "Tomorrow's trips:\n"+'- '+date_lib.format(new Date(trip.arrivalTime*60000+1.8e+7),'h:mm A' )+'\n'
            }
        });

    });


    return formatted;

}

let static_parse = async (stop_number, route_filter) =>{

    const Promise_pool = db.promise();

    const now_in_min = parseInt(date_lib.format(new Date(), 'H' )) * 60 + parseInt(date_lib.format(new Date(), 'm' )) //H is hours 0-24, m is minutes 0-60
    var tomorrow = new Date();
    //daw_list is a Tuple of Today's formatted date & tomorrow's formatted date. [today,tmrw]
    const daw_list = daw_classif(date_lib.format(new Date(), 'dddd') , date_lib.format(new Date(Date.now()+1000*60*60*24), 'dddd' ));

    //It's fine to use a template literal with unescaped insertions here since this data can never be tampered with by the user: (the user_input_parser filters it)
    let static_query = `SELECT * FROM static_times WHERE stopId = ${stop_number} AND `;
    daw_list[0] == daw_list[1] ? static_query += `serviceId = '${daw_list[0]}'` : static_query += `serviceId IN ('${daw_list[0]}','${daw_list[1]}')`;
    console.log(static_query);

    //MySQL Promisified query using command string: static_query...
    const [static_res,static_inf] = await Promise_pool.query(static_query);
    static_res.sort((a, b) => a.arrivalTime - b.arrivalTime);


    let static_query_split = {
        today: static_res.filter(trip => trip.serviceId == daw_list[0] && trip.arrivalTime >= now_in_min)  ,
        tmrw: static_res.filter(trip => trip.serviceId == daw_list[1])
    }
    //While checking for the indexes generated by both these functions, reference the static_query_split OBJ
     let trip_ref_obj = {
         today: transfer_check(static_query_split.today), 
         tmrw: transfer_check(static_query_split.tmrw)
     }



    //Checking if route_filter exists, if so, proceed to check for transfers..
    if(route_filter){ 
        //If there are no Transfers (If all elements in (keys: today , tmrw) are equal to a length of 1)
        if( trip_ref_obj.today.some(t => t.length <= 1) && trip_ref_obj.tmrw.some(t => t.length <= 1)  ){
            console.log("NO TRANSFERS!")
            //Update Query objects
                //today
            static_query_split.today = static_query_split.today.filter(trip => trip.routeId == route_filter);
            trip_ref_obj.today = transfer_check(static_query_split.today);
                //tmrw
            static_query_split.tmrw = static_query_split.tmrw.filter(trip => trip.routeId == route_filter );
            trip_ref_obj.tmrw = transfer_check(static_query_split.tmrw);
        }
    }

    //Sorting route patterns:
    trip_ref_obj.today = route_pattern_sort(trip_ref_obj.today , static_query_split.today);
    trip_ref_obj.tmrw = route_pattern_sort(trip_ref_obj.tmrw, static_query_split.tmrw);

    /* DEBUG
    console.log(trip_ref_obj);
    console.log(daw_list)
    console.log(now_in_min);
    */

    //Formatting:
    return await static_data_format(trip_ref_obj, static_query_split,stop_number);




}

module.exports = {
    static_parse
}
