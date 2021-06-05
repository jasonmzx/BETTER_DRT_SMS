const fetch = require('node-fetch');
let body = { a: 1 };

const stopId = 2242

function formatJson(json_return){
//console.log(json_return);
let result = json_return.Name + "\n\n"

function TripFormat(item, index){
    

    //This function calculates the amount of time between the Current Time (c_time) & the time the bus is arriving (a_time)
    function ArrivalTimeDifference(){
    //const c_time = [Math.floor(new Date().getTime()/8.64e+7 - 0.166667), new Date().getTime()/8.64e+7 - 0.166667]
    const c_time = (new Date().getTime()/8.64e+7 - 0.166667 - Math.floor(new Date().getTime()/8.64e+7 - 0.166667))*86400;
    let a_time = 0;
    if (item.RealTime > 86400){
        a_time = item.RealTime-86400;
    } else {
        a_time = item.RealTime;
    };
    return Math.floor((a_time - c_time)/60)
    }

    //Here is the formatting for each trip:
    result = result.concat(`ROUTE ${item.RouteId} - ${item.RealTimeFormatted}\n(arrival in ${ArrivalTimeDifference()} minutes)\n\n`)
};

json_return.Trips.forEach(TripFormat)

console.log(result)
};


function fetchStop(stopId){
fetch(`https://www.durhamregiontransit.com/Modules/NextRide/services/GetStopTimes.ashx?stopId=${stopId}`, {
    method: 'post',
    body:    JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
})
.then(res => res.json())
.then(json => formatJson(json));
}

fetchStop(stopId);
