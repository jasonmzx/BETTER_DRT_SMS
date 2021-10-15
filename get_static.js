const http = require('https'); // or 'https' for https:// URLs
const fs = require('fs');
const util = require('util');
const exec = require('child_process').exec;
const db = require('./database_pool.js');


const Promise_pool = db.promise();

//Path to Directory where durham_data.zip will be saved:
const path = `static_test/durham_data.zip`; 
const file = fs.createWriteStream(path);

let curl_get_header = `curl -I https://maps.durham.ca/OpenDataGTFS/GTFS_Durham_TXT.zip`;

//It's ugly since I had to wrap into a promise and use the .then function however it works
let execPromise = (command) => {
  return new Promise(function(resolve, reject) {
      exec(command, (error, stdout, stderr) => {
          if (error) {
              reject(error);
              return;
          }

          resolve(
            {
            e_tag: ((stdout.split('\n')[5]).trim()).slice(7,-1),
            last_modif: ((stdout.split('\n')[3]).trim()).slice(15), //%%Fix this to be less then 20 characters
            }
            );
      });
  });
}

//Basically await's the promise, then use e_tag 
execPromise(curl_get_header).then(async (header_object) => {
  console.log(header_object);
  const [init_query,init_fields] = await Promise_pool.query("SELECT * FROM `e_tag` WHERE e_tag = ?",[header_object.e_tag]);

  //The query exists (This means it's up to date)
  if( init_query.length ){
    console.log(init_query[0])


  //The query doesn't exist (If Outdated)
  } else {
    console.log('Static Data is outdated!')

    //Reset E_tag table:
    Promise_pool.execute('TRUNCATE TABLE `e_tag`;');

    //Insert new data into table
    Promise_pool.query(`INSERT INTO e_tag (e_tag,last_modif) VALUES (?,?)`,[header_object.e_tag , header_object.last_modif]);

    //Download new ZIP file:
    const request = http.get("https://maps.durham.ca/OpenDataGTFS/GTFS_Durham_TXT.zip", function(response) {
      response.pipe(file);
    });

    //extract zip to static_files folder (only routes.txt , stops.txt, stop_times.txt & trips.txt)

    //delete (rm) the zip

    //execute generate file with specific settings


  }






});








//console.log(request);