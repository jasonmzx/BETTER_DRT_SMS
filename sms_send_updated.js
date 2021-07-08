const http = require("http");
const express = require('express');
const mysql = require('mysql');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const twilio = require("twilio");
const { json } = require("express");
const { table } = require("console");

const body = { a: 1 };

//Create MYSQL connection:
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'maindb',
    multipleStatements: true
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
function formatJson(json_return, fav_name){
    //console.log(json_return);
    let result = ''
    if (fav_name == null){
        result = json_return.Name + "\n\n"
    } else {
        result = json_return.Name + "\n" + fav_name + "\n\n"
    }

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

let formatCreateFavorite = (data) => {
    if (data.stop_desc == ''){
        return `[Created Favorite]\n@${data.stop_nick}\n\n[Corresponding stop]:\n ${data.stop_id} - (${data.stop_name})\n\nYou can now use @${data.stop_nick} instead of @${data.stop_id} to search times.`
    } else {
        return `Created Favorite: ${data.stop_nick}\nCorresponding stop: ${data.stop_id}\n${data.stop_name}\nStop Description:\n${data.stop_desc}`
    }

}

app.use(bodyParser.urlencoded({ extended: false }));


app.post('/sms', (req,res)=> {
    //Client's attributes:

    //Client's message
    const user_input = (req.body.Body).trim()
    //Client's Phone Number
    const user_number = req.body.From
    //Name of Client's Table in MySQL
    const table_name = "c_" + user_number.slice(1,user_number.length)

    const twiml = new MessagingResponse();
    console.log(`From: ${user_number} , text sent: ${user_input}`);
    //##
    //Stop request: If user's input contains '@' at the 0th index of the string & the rest of the string is numeric (Not NaN), then proceed to try and fetch said number from DRT API!
    //##
    
    if(user_input[0] == '@'){

        //Everything after the @ is numbers E.X. @123456
        if (isNaN(user_input.slice(1, user_input.length)) == false ){
        
            const stopId = user_input.slice(1, user_input.length);

            drt_api_fetch(stopId).then((result) => {
                console.log(result);
                //If StopID isn't found (send error msg)
                if (result == null){
                    twiml.message(`Stop ${stopId} was not found.`)
                    res.writeHead(200, { 'Content-Type': 'text/xml' });
                    res.end(twiml.toString());
                //StopID Is found, Send formatted version of API result to client.
                } else {
                    twiml.message(formatJson(result, null));
                    res.writeHead(200, { 'Content-Type': 'text/xml' });
                    res.end(twiml.toString());
                }
            });

        }
        else {
            console.log("goes here!")
            const FavId = user_input.slice(1, user_input.length);
            db.query(`SELECT * FROM ${table_name} WHERE stop_nick = '${FavId}'`,(q_err,q_res) => {
                console.log(JSON.parse(q_res[0].stop_id));       
                drt_api_fetch(JSON.parse(q_res[0].stop_id)).then((result) => {
                    console.log(result);
                    //If StopID isn't found (send error msg)
                    if (result == null){
                        twiml.message(`Favorite ${FavId} was not found.`)
                        res.writeHead(200, { 'Content-Type': 'text/xml' });
                        res.end(twiml.toString());
                    //StopID Is found, Send formatted version of API result to client.
                    } else {
                        twiml.message(formatJson(result,JSON.stringify(q_res[0].stop_nick)));
                        res.writeHead(200, { 'Content-Type': 'text/xml' });
                        res.end(twiml.toString());
                    }
                });
            });
            

        } 

    } // END OF @ command   

    else if (user_input[0] == '$'){

        let inp_arr = user_input.split(" ")
        console.log(`Length of array is ${inp_arr.length}`)
        //Numbers after $ at index 0 in inp_arr (StopID) 
        const stopId = inp_arr[0].slice(1,inp_arr[0].length)

        if ( isNaN(stopId) == false && inp_arr.length > 1 && inp_arr[1] != 'list' ){

            drt_api_fetch(stopId).then((result) =>{
                //Api throws error
                if(result == null){

                } else {
                    
                    const postData = {
                        ID : user_number,
                        stop_name : result.Name,
                        stop_id : result.StopId.slice(0, result.StopId.length-2),
                        stop_nick : inp_arr[1] ,
                        stop_desc : user_input.slice(inp_arr[0].length + inp_arr[1].length+2,user_input.length)
                    }

                    
                    let sql = ``
                    //Search Query that returns data as a result (SQL_s_err or res represents SQL_Search_Error or Result)    
                    db.query(`SELECT * FROM ${table_name} WHERE stop_id = '${postData.stop_id}' `, (SQL_s_err,SQL_s_res,fields)=> {
                        console.log(JSON.stringify(SQL_s_res))
                        //Set SQL command to Alter Table of ID:
                        sql =  `INSERT INTO ${table_name} 
                        SET stop_id = '${postData.stop_id}',
                        stop_nick = '${postData.stop_nick}',
                        stop_desc = '${postData.stop_desc}',
                        stop_name = '${postData.stop_name}'; `;
                  
                        if(JSON.stringify(SQL_s_res) != "[]"){
                            sql = `UPDATE ${table_name} 
                            SET stop_nick = '${postData.stop_nick}',
                                stop_desc = '${postData.stop_desc}'
                            WHERE stop_id = '${postData.stop_id}';`    
                        }

                        
                        //If TABLE doesn't exist: Adjust SQL Command:
                        if(SQL_s_err){
                            if (SQL_s_err.code == 'ER_NO_SUCH_TABLE'){
                                console.log("User doesn't have a table in DB")
                                console.log(SQL_s_res)
                                sql = `CREATE TABLE ${table_name}(
                                    stop_id VARCHAR(10) NOT NULL, 
                                    stop_nick VARCHAR(50) NOT NULL, 
                                    stop_desc MEDIUMTEXT, 
                                    stop_name MEDIUMTEXT); 
                                    INSERT INTO ${table_name} 
                                    SET stop_id = '${postData.stop_id}',
                                    stop_nick = '${postData.stop_nick}',
                                    stop_desc = '${postData.stop_desc}',
                                    stop_name = '${postData.stop_name}';`;
                            }
                            else throw(SQL_s_err);
                        }

                        console.log("THis here is the return: "+ sql) 
                        //Post Query that takes the DATA from postData and inserts or updates the DB
                        db.query(sql, (SQL_p_err,SQL_p_res)=> {
                            console.log(SQL_p_res);
                            twiml.message(formatCreateFavorite(postData));
                            res.writeHead(200, { 'Content-Type': 'text/xml' });
                            res.end(twiml.toString());

                            if(SQL_p_err) throw "ERRNO!!!" + SQL_p_err;
                            //Handle possible error here...
                        });

                    
                    });    


                }
            });    
        } 


    } else {
        twiml.message("Sorry, this command was invalid, \n For proper use, try @### , replace the hashtags with prefered stop ID")
    }


});

http.createServer(app).listen(1338, () => {
    console.log("express is running! (port: 1338)")
    let post_data = {}
})