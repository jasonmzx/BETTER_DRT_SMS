const fetch = require('node-fetch');
const body = { a: 1 };

const fs = require('fs');

let stopId = 2242


for(let i =0; i < 2000; i++){
    fetchStop(i)
}



function fetchStop(stopId){
    fetch(`https://www.durhamregiontransit.com/Modules/NextRide/services/GetStopTimes.ashx?stopId=${stopId}`, {
        method: 'post',
        body:    JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    })
    .then(res => res.json())
    .then(json => fs.appendFileSync( 'stop_list_2.json', JSON.stringify( [json.StopId.slice(0,json.StopId.length-2) , json.Name ] ) + ", \n" ) ) 
    .catch((error) => console.log('error404'));
}

