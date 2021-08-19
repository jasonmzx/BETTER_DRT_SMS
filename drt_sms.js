const express = require('express');
const http = require("http");
const bodyParser = require('body-parser');

const mysql = require('mysql2');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const twilio = require("twilio");

//Local files:
const u_auth = require('./user_processing/user_auth');
const u_parse = require('./user_processing/user_input_parser');
const realtime_parse = require('./realtime_parsers/gtfs_realtime_parser');
const static_parse = require('./static_parsers/static_time_resp');
const { stat } = require('fs');

//MySQL


//Express 
const better_drt_sms = express();

better_drt_sms.use(bodyParser.urlencoded({ extended: false }));

better_drt_sms.post('/sms', async (req,res)=> {

    //Twiml response:
    const twiml = new MessagingResponse();

    let send_response = (message, expiry_state) => {
        twiml.message(message + (expiry_state ? "\nYou've Expired!" : ''));
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString());
        console.log('[DRT_SMS] SMS MESSAGE SUCCESSFULLY SENT!')
    }

//app
    // const twiml = new MessagingResponse();
    
    const user = await u_auth.user_auth(req.body.From);
    console.log(`\n REQUEST FROM: ${user[0]} >> ( ${user[1] ? 'Expired' : 'Not expired.' } )`)
    //Send message to user if he's expired
 

    const input_parser_response = await u_parse.input_parse(req.body.Body,user[0]);
    if(typeof input_parser_response === 'string'){
        send_response(input_parser_response,user[1]);
    } else {
        //Realtime fetch:
        if(input_parser_response.action == 1){
            console.log(`~~REALTIME REQUEST, stop_id: ${input_parser_response.stop_id} , route_filter: ${input_parser_response.route_filter ? input_parser_response.route_filter : 'None' } \n`);    
            send_response(await realtime_parse.gtfs_parse(input_parser_response.stop_id,input_parser_response.route_filter));
        //Static fetch:    
        } else {
            console.log(input_parser_response + '\n');  
            send_response(await static_parse.static_parse(input_parser_response.stop_id,input_parser_response.route_filter));
        }

    }
    

});

http.createServer(better_drt_sms).listen(2000, () => {
    console.log("DRT_SMS IS RUNNING ON PORT 2000 ! \n")
    let post_data = {}
});

