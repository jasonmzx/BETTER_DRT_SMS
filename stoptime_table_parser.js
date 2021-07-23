const mysql = require('mysql');
const date = require('date-and-time');
const now = new Date()

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'drt_sms_db',
    multipleStatements: true
});

//Connect
db.connect((err) => {
    if(err){
        throw err;
    }
    console.log('MySQL is loaded!')
});


let daw_classif = daw => {
    if (['Monday','Tuesday','Wednesday','Thursday','Friday'].includes(daw) == true ){
        return 'Weekday'
    }   else {return daw};
};

//Setting Date and Date+1

const day_type = daw_classif(date.format(new Date(), 'dddd'));

//New instance of the date plus 1 Day:
let new_date = new Date()
new_date.setDate(new_date.getDate() + 1)

const day_type_p1 = daw_classif(date.format(new_date, 'dddd'));


console.log(`Dates: ${day_type} , ${day_type_p1}`)

let staticTimes = stopId => { 
    return new Promise(resolve => {
        db.query(`SELECT * FROM stop_times WHERE stop_id = ${stopId}`, (err,res) => {
            resolve(res);
        });

    });

};


const current_time = date.format(now, 'HH:mm');
//gives time in hh:mm format: e.g 01:23
console.log(current_time)

//Day of the Week Classifications:

//Formatting current time into minutes (1:30) -> 90 (60 + 30)
const formattedCurrentTime = parseInt(date.format(now, 'HH'))*60 + parseInt(date.format(now, 'mm')) 
console.log(formattedCurrentTime)

staticTimes('2242').then(result => {
    
    const formattedData = {}
    
    //Generating formatted Data:
    result.forEach(elm => {
        const route_class = `${elm.route_id} ${elm.orientation}`
        //Making sure the Dictionary of a specific route exists in array
        //=> before trying to append data into it... 
        // const Routes = formattedData.map(route_dict => {
        //     return Object.keys(route_dict)[0]
        // })    

        //if(Object.keys(formattedData).includes(route_class) == false)

        formattedData[route_class] = formattedData[route_class] || {today: [] , tmrw : [] }

        
        //Appending Data in specified route dict, if day_type corresponds..
        if (day_type == elm.service_id && formattedCurrentTime <= elm.arrival_time ) 
        {
            formattedData[route_class].today.push(elm.arrival_time)
        } if (day_type_p1 == elm.service_id){
            formattedData[route_class].tmrw.push(elm.arrival_time)
        }
 
    })

    console.log(formattedData)
    //Sorting formattedData:
    Object.keys(formattedData).forEach(route_key => {
        formattedData[route_key].today.sort((a, b) => a - b)
        formattedData[route_key].tmrw.sort((a, b) => a - b)
    });


});