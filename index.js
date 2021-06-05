const fetch = require('node-fetch');
const body = { a: 1 };
 
//Twilio stuff:
const accountSid = 'AC574a17939044e2de34f239c9c241ef3a'
const authToken = 'b9880026f2c634d6e387de094592d11f'

const client = require('twilio')(accountSid, authToken);

client.messages.create({
    to: "+16472890309",
    from: '+16478008872',
    body: 'hello vero!'
})
.then((message)=>console.log(message.sid))


let stopId = 2242

function fetchStop(stopId){
    fetch(`https://www.durhamregiontransit.com/Modules/NextRide/services/GetStopTimes.ashx?stopId=${stopId}`, {
        method: 'post',
        body:    JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    })
    .then(res => res.json())
    .then(json => console.log(json));
}

//nodefetchStop(stopId)