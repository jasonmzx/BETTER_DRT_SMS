const http = require("http");
const express = require('express');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const twilio = require("twilio");

const body = { a: 1 };

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));



app.post('/sms', (req,res)=> {
    //User who sent this message's attributes:
    const user_input = req.body.Body
    const user_number = req.body.From

    const twiml = new MessagingResponse();
    console.log(`From: ${user_number} , text sent: ${user_input}`);
    //Stop request: If user's input contains '@' at the 0th index of the string & the rest of the string is numeric (Not NaN), then proceed to try and fetch said number from DRT API!
    if (user_input[0] == "@" && isNaN(user_input.slice(1, user_input.length)) == false ){
    twiml.message("Succesful stop requst command!")
    const stopId = user_input.slice(1, user_input.length)

    function messageSend(json_return){
        console.log(json_return.Name)
        twiml.message(json_return.Name);
    
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString());
        }

        fetch(`https://www.durhamregiontransit.com/Modules/NextRide/services/GetStopTimes.ashx?stopId=${stopId}`, {
            method: 'post',
            body:    JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        })
        .then(res => res.json())
        .then(json => messageSend(json));






    } else {
        twiml.message("Sorry, this command was invalid, \n For proper use, try @### , replace the hashtags with prefered stop ID")
    }



});

http.createServer(app).listen(1337, () => {
    console.log("express is running!")
})