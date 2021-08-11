//CREATE TABLE stops(stop_id MEDIUMINT UNSIGNED, stop_name VARCHAR(100), wheelchair_access TINYINT)

//Importing database pool:
const db = require('../database_pool.js');

let stops_generate = async (static_file_path) => {

    const Promise_pool = db.promise();

    console.log("Success!")

}

module.exports = {
    stops_generate
}