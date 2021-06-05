const fetch = require('node-fetch');
let body = { a: 1 };

const stopId = 2242

function formatJson(json_return){
console.log(json_return);
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
