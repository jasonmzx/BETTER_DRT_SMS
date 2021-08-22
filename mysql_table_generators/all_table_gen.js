//Internal files
const db = require('../database_pool.js');


let user_generate = async () => {
    const db_promise = db.promise();
    db_promise.query(`CREATE TABLE users(user_number VARCHAR(14) PRIMARY KEY, user_expiry BIGINT(20))`);    
}

let stop_aliases_generate = async () => {
    const db_promise = db.promise();
    db_promise.query(`CREATE TABLE stop_aliases(stop_id MEDIUMINT(8), alias VARCHAR(75), alias_owner VARCHAR(14), stop_name VARCHAR(70))`);      
}

let realtime_gtfs_generate = async () => {
    const db_promise = db.promise();
    db_promise.query(`CREATE TABLE realtime_gtfs(expiryTime BIGINT(10), routeId MEDIUMINT(8), vehicleId SMALLINT(5), arrivalTime INT(10), stopId MEDIUMINT(8), tripId VARCHAR(70))`);    
}

let static_table_generate = async () => {
    const db_promise = db.promise();
    db_promise.query(`CREATE TABLE static_times(routeId SMALLINT UNSIGNED, serviceId VARCHAR(20), tripId VARCHAR(70), stopId MEDIUMINT UNSIGNED, arrivalTime INT UNSIGNED, orientation VARCHAR(70), tripHeadsign VARCHAR(80));`);
    db_promise.query(`CREATE TABLE stops(stop_id MEDIUMINT UNSIGNED, stop_name VARCHAR(100), wheelchair_access TINYINT)`);
    db_promise.query(`CREATE TABLE trips(trip_id VARCHAR(70), trip_headsign VARCHAR(80),direction VARCHAR(70))`);
}


module.exports = {
    user_generate,
    stop_aliases_generate,
    realtime_gtfs_generate,
    static_table_generate
}