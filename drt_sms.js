const express = require('express');
const http = require("http");
const bodyParser = require('body-parser');

const mysql = require('mysql2');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const twilio = require("twilio");

//Local files:
const u_auth = require('./user_processing/user_auth')


//MySQL


//Express 
const better_drt_sms = express();

better_drt_sms.use(bodyParser.urlencoded({ extended: false }));

better_drt_sms.post('/sms', async (req,res)=> {

    //Twiml response:
    const twiml = new MessagingResponse();

    let send_response = (message) => {
        twiml.message(message);
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString());
    }

//app
    // const twiml = new MessagingResponse();

    const user = await u_auth.user_auth(req.body.From);
    console.log(`Authenticated ${user[0]}, [${user[1] ? 'Expired' : 'Not expired'}]`)
    //Send message to user if he's expired
    if(user[1]){
        send_response(`You're expired!`);
    } 



});

http.createServer(better_drt_sms).listen(2000, () => {
    console.log("DRT_SMS IS RUNNING ON PORT 2000 !")
    let post_data = {}
});

