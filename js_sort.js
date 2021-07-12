const fetch = require('node-fetch');

const drt_api_fetch = async (stop_num) => {
    console.time('func2')
    let body = {a:1};
    const data = 
    { method: 'post',
      body: JSON.stringify(body),
      headers:  { 'Content-Type': 'application/json' },
    }
    return fetch(`https://www.durhamregiontransit.com/Modules/NextRide/services/GetStopTimes.ashx?stopId=${stop_num}`, data)
    .then(res => res.json())
    .catch((error) => null )
    
}

drt_api_fetch(2242).then(result => {
    console.timeEnd('func2');
    console.log(result)
})