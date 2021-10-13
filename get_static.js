const http = require('https'); // or 'https' for https:// URLs
const fs = require('fs');
const util = require('util');
const exec = require('child_process').exec;

const db = require('../database_pool.js');

const path = `static_test/durham_data.zip`; 
const file = fs.createWriteStream(path);

let curl_get_header = `curl -I https://maps.durham.ca/OpenDataGTFS/GTFS_Durham_TXT.zip`;

const child = exec(curl_get_header, function(error, stdout){
  console.log(stdout);
  const e_tag_data  = ((stdout.split('\n')[5]).trim()).slice(7,-1); //Cleans up the response and isolates Last-Modified date.
  console.log(e_tag_data);
  });


const request = http.get("https://maps.durham.ca/OpenDataGTFS/GTFS_Durham_TXT.zip", function(response) {
  response.pipe(file);
});


//console.log(request);