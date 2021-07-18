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

const day_type = daw_classif(date.format(new Date(), 'dddd'));

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

console.log('*** '+day_type+' ***')

staticTimes('2242').then(result => {
    
    const formattedData = {}
    
    result.forEach(elm => {
        //console.log(elm);
        //Making sure the Dictionary of a specific route exists in array
        //=> before trying to append data into it... 
        // const Routes = formattedData.map(route_dict => {
        //     return Object.keys(route_dict)[0]
        // })    


        if(Object.keys(formattedData).includes(elm.route_id) == false)
        { 
            formattedData[elm.route_id] = []
        };
        
        //Appending Data in specified route dict, if day_type corresponds..
        if (day_type == elm.service_id){
            formattedData[elm.route_id].push(elm.arrival_time + " " + elm.service_id)
        };
 
    })

    console.log(formattedData)
});