//This File generates all static MySQL Tables for the app.

//Local dependencies:
const static_times_gen = require('./mysql_table_generators/static_times_gen');
const stops_gen = require('./mysql_table_generators/stops_gen');
const trips_gen = require('./mysql_table_generators/trips_gen');
const routes_gen = require('./mysql_table_generators/routes_gen')
const all_table_gen = require('./mysql_table_generators/all_table_gen')

const PATH_TO_STATIC = './mysql_table_generators/STATIC_FILES'

const SETTINGS = {
    EXEC_STATIC_GEN: true, //Set this to true if you'd like to generate any tables from the STATIC_GEN key below:
    STATIC_GEN: { //Here you can configure which tables will be generated if EXEC_STATIC_GEN is true.
        static_times: [false, static_times_gen.static_times_generate, PATH_TO_STATIC], 
        stops: [true, stops_gen.stops_generate, PATH_TO_STATIC ],
        trips: [true, trips_gen.trips_generate, PATH_TO_STATIC],
        routes: [true, routes_gen.routes_generate ,PATH_TO_STATIC] //routes isn't a database table, it's a JSON file
    },
    EXEC_INIT_GEN: false, //Set this to true if you'd like to generate any tables from the INIT_GEN key below:
    INIT_GEN: { //Here you can configure which tables will be generated if EXEC_INIT_GEN is true.
        users: [true, all_table_gen.user_generate ],
        stop_aliases: [true, all_table_gen.stop_aliases_generate],
        realtime_gtfs: [true, all_table_gen.realtime_gtfs_generate],
        static_gen: [true, all_table_gen.static_table_generate]
    }
}

let generate = async (SETTINGS) =>{

if(SETTINGS.EXEC_INIT_GEN == true){
    for(const table of Object.keys(SETTINGS.INIT_GEN)){
        if(SETTINGS.INIT_GEN[table][0] == true){
            await SETTINGS.INIT_GEN[table][1]();   
            }
        }
}

if(SETTINGS.EXEC_STATIC_GEN == true){
    //(Object.keys(SETTINGS.STATIC_GEN)).forEach(async (table) => {
    for(const table of Object.keys(SETTINGS.STATIC_GEN)){
    if(SETTINGS.STATIC_GEN[table][0] == true){
        await SETTINGS.STATIC_GEN[table][1](SETTINGS.STATIC_GEN[table][2]);   
        }
    }
}


}
generate(SETTINGS);
