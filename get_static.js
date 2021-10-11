const http = require('https'); // or 'https' for https:// URLs
const fs = require('fs');

const path = `C:/durham_data.zip`; 
const file = fs.createWriteStream(path);
const request = http.get("https://maps.durham.ca/OpenDataGTFS/GTFS_Durham_TXT.zip", function(response) {
  response.pipe(file);
});

console.log(request);