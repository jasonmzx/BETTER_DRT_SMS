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

const app = express();
 
//Favorite Creation Function:
function CreateFavorite(inp, pk){
    //Array of command typed by Client
    let inp_arr = inp.split(" ")
    console.log(`Length of array is ${inp_arr.length}`)
    //Numbers after $ in the first string in inp_arr (stop id)
    const stop_num = inp_arr[0].slice(1,inp_arr[0].length)
    
    if (inp_arr[0][0] == "$" && isNaN(stop_num) == false && inp_arr.length > 1 ){ 
        console.log("Valid stop number")
        const stopNum = async (stop_num) => {
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
        stopNum(stop_num).then(function(result){
             if (result == null){ //API Throws error (invalid user input)
             return null
             } 
             //Successful response from API
             else {
                 //Optimize the strings for sql 
                    const postData = ``
                    
                    //Check IF confirm_favorite ID is in the Database:
                    db.query(`SELECT * FROM confirm_favorite WHERE ID = '${pk}' `, (err,res,fields)=> {
                        console.log(JSON.stringify(res))
                        //Set SQL command to Alter Table of ID:
                        let sql = `UPDATE confirm_favorite 
                                    SET stop_name = '${result.Name}',
                                        stop_id = '${result.StopId}',
                                        stop_nick = '${inp_arr[1]}',
                                        stop_desc = '${inp.slice(inp_arr[0].length + inp_arr[1].length+2,inp.length)}'
                                    WHERE ID = '${pk}'; 
                                        `    
                        //If Entry doesn't exist: (Rewrite SQL command)
                        if (JSON.stringify(res) == '[]'){
                            console.log("User doesn't have an entry in DB")
                            sql = `INSERT INTO confirm_favorite SET ID = '${pk}',
                                        stop_name = '${result.Name}',
                                        stop_id = '${result.StopId}',
                                        stop_nick = '${inp_arr[1]}' ,
                                        stop_desc = '${inp.slice(inp_arr[0].length + inp_arr[1].length+2,inp.length)}'`
                        } 

                        db.query(sql, (error,result)=> {
                            console.log(result);
                            if(error) throw error
                            //Handle possible error here...
                        });

                        if(err) throw err;
                    }); 
                //console.log(FormattedData);
                }
            
            })
        
    
    
        } // The end of IF
    
    } // End of CreateFavorite

//Creation of Database!
// ;;;
// let sql = 'CREATE DATABASE maindb';
// db.query(sql, (err,result) =>{
//     if(err) throw err;
//     console.log(result)    

// });

// //create table
// let sql = `CREATE TABLE confirm_favorite(
//             ID VARCHAR(30) NOT NULL,
//             stop_id VARCHAR(10) NOT NULL,
//             stop_nick VARCHAR(50) NOT NULL,
//             stop_desc MEDIUMTEXT, 
//             stop_name MEDIUMTEXT,
//             PRIMARY KEY (ID) 
//             );`;
// let sql = 'DROP TABLE clients';
// db.query(sql, (err,result) =>{
//      if(err) throw err;
//      console.log(result);
//  }); 

// let sql = '';
//  db.query(sql, (err,result) =>{
//      if(err) throw err;
//      console.log(result);
//  }); 

// let post_data = {id:'+12899282058',favorite:'[]',routes:'[]'}
// let sql = 'INSERT INTO clients SET ?'
// let query = db.query(sql, post_data, (err,res) => {
//     if(err) throw err;
//     console.log(res);
// })


app.use(bodyParser.urlencoded({ extended: false }));

//This is the Formatter for the API:
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
    //The stopID being used to fetch the API:
    const stopId = user_input.slice(1, user_input.length)

    //If the API successfully retrieves stopId's JSONData, then the messageSend function will execute:
    function messageSend(json_return){
        twiml.message(formatJson(json_return));
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString());
    }
    //If the API isn't able to retrieve the JSONData from the stopId requested, it will catch the error and execute the messageFail function:
    function messageFail(){
        twiml.message(`Stop: ${stopId} was not found.`)
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString());
    }

        fetch(`https://www.durhamregiontransit.com/Modules/NextRide/services/GetStopTimes.ashx?stopId=${stopId}`, {
            method: 'post',
            body:    JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        })
        .then(res => res.json())
        .then(json => messageSend(json))
        .catch((error) => messageFail());

    } 
    else if (user_input[0] == '$'){

    CreateFavorite(user_input, user_number);
            

    } else {
        twiml.message("Sorry, this command was invalid, \n For proper use, try @### , replace the hashtags with prefered stop ID")
    }


});

http.createServer(app).listen(1338, () => {
    console.log("express is running! (port: 1338)")
    let post_data = {}
})