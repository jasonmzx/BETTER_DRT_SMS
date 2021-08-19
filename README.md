# BETTER_DRT_SMS
A better SMS (Text Message) Bus tracker &amp; Schedule for [Durham Region Transit](https://www.durhamregiontransit.com/) (Municipality of Durham's city bus service)

Tech Stack:
* This application was built on [Node.js](https://nodejs.org/en/) *(JavaScript runtime environment)* 
* The Node.js web framework [express](https://www.npmjs.com/package/express) is used to run an HTTP server. *(API Endpoint for post requests)*
* [Twilio](https://www.twilio.com/sms)  handles incoming & outgoing SMS messages. *(Sends data to express server's HTTP post endpoint)*
* This application communicates with a [MySQL Server](https://www.mysql.com/) using the Node.js library [MySQL2](https://www.npmjs.com/package/mysql2). *(continuation of MySQL-Native)*
* [JS GTFS-realtime Bindings](https://www.npmjs.com/package/gtfs-realtime-bindings) Is used to read the realtime transit data being fetched from the [OpenData Durham](https://opendata.durham.ca/search?q=gtfs) website.
* The [date-and-time](https://www.npmjs.com/package/date-and-time) library is used to format various timetables &amp; dates.

Useful Docs:
* [Google's GTFS Documentation](https://developers.google.com/transit/gtfs) Static docs & Realtime docs.
* [Twilio's SMS Docs for Node.js](https://www.twilio.com/docs/sms/tutorials/how-to-receive-and-reply-node-js) Shows how to use their built in Messaging Response Functionality (TwiML) &amp; basic express setup.
* [MySQL2 npm Docs](https://www.npmjs.com/package/mysql2) Same link as above, very useful for setting up MySQL2 in node, and using all its functionalities.



