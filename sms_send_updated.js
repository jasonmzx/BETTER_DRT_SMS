const http = require("http");
const express = require('express');
const mysql = require('mysql');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const twilio = require("twilio");
const { json } = require("express");

const body = { a: 1 };

//Create MYSQL connection:
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'maindb'
});

//Connect
db.connect((err) => {
    if(err){
        throw err;
    }
    console.log('MySQL is loaded!')
})

//express
const app = express();
 
//Function that requests DRT's API passing in the stop number, and returns a JSON Response
const drt_api_fetch = async (stop_num) => {
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

//This is the Formatter for JSON Response:
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
    
    if (json_return.Trips.length == 0){
        result = result.concat('No data available.')
    } else{
    json_return.Trips.forEach(TripFormat)
    }
    return result
};


app.use(bodyParser.urlencoded({ extended: false }));


app.post('/sms', (req,res)=> {
    //User who sent this message's attributes:
    const user_input = req.body.Body
    const user_number = req.body.From

    const twiml = new MessagingResponse();
    console.log(`From: ${user_number} , text sent: ${user_input}`);
    //##
    //Stop request: If user's input contains '@' at the 0th index of the string & the rest of the string is numeric (Not NaN), then proceed to try and fetch said number from DRT API!
    //##
    if (user_input[0] == "@" && isNaN(user_input.slice(1, user_input.length)) == false ){
        
        const stopId = user_input.slice(1, user_input.length)

        drt_api_fetch(stopId).then((result) => {
            twiml.message(formatJson(result));
            res.writeHead(200, { 'Content-Type': 'text/xml' });
            res.end(twiml.toString());

        });

    } 
    else if (user_input[0] == '$'){

    CreateFavorite(user_input, user_number).then((cf_res) => console.log("Return: " + cf_res))
            

    } else {
        twiml.message("Sorry, this command was invalid, \n For proper use, try @### , replace the hashtags with prefered stop ID")
    }


});

http.createServer(app).listen(1338, () => {
    console.log("express is running! (port: 1338)")
    let post_data = {}
})