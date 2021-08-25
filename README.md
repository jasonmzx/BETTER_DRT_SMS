# BETTER_DRT_SMS
A better SMS (Text Message) Bus tracker &amp; Schedule for [Durham Region Transit](https://www.durhamregiontransit.com/) (Municipality of Durham's city bus service)

Tech Stack:
* This application was built on [Node.js](https://nodejs.org/en/) *(JavaScript runtime environment)* 
* The Node.js web framework [express](https://www.npmjs.com/package/express) is used to run an HTTP server. *(API Endpoint for post requests)*
* [Twilio](https://www.twilio.com/sms)  handles incoming & outgoing SMS messages. *(Sends data to express server's HTTP post endpoint)*
* This application communicates with a [MySQL Server](https://www.mysql.com/) using the Node.js library [MySQL2](https://www.npmjs.com/package/mysql2). *(continuation of MySQL-Native)*
* [JS GTFS-realtime Bindings](https://www.npmjs.com/package/gtfs-realtime-bindings) Is used to decode the realtime transit data being fetched from the [OpenData Durham](https://opendata.durham.ca/search?q=gtfs) website.
* The [date-and-time](https://www.npmjs.com/package/date-and-time) library is used to format various timetables &amp; dates.

Hosting / Server Setup:
* A VPS running Ubuntu 20.04 with a public IPv4 Address (Secured with a password for SSH access to Ubuntu CLI) is the host to both express & MySQL servers. (services) <br>

    - MySQL server is ran as a service.<br>*Start the MySQL service:* ```[sudo] service mysql start``` <br>*Check status of service:* ```[sudo] service mysql status```
    -  express server connects to MySQL server locally, via localhost.

    -  Unlike MySQL, Node.js isn't ran as a service. Therefore, once the SSH connection is closed, the express server is stopped. [tmux](https://tmuxcheatsheet.com/) is used to fix this.  *(tmux is a terminal multiplexer used to make sub-sessions within the SSH session (terminal), when the main terminal closes, the sub-session(s) can still run)* The NodeJs express server is ran in a tmux sub-session. (this runs very similarly to service) <br>**SETUP (in terminal):**<br>**1**. ``` tmux``` to create a session.<br>**2**. Run node server once in session ```node drt_sms.js```<br>**Extra CMDS**:<br>  ``` tmux ls``` to check all sessions.<br>```tmux attach -t <session name>``` to re-connect to sessions.

    - Ubuntu's timezone setting must be changed since the app's files use the operation system's date.
<br>**>** ``` sudo timedatectl set-timezone America/New_York ``` 

How Twilio communicates with Node.js express server:
* The VPS's IPv4 Address is publicly accessible & the express HTTP server runs on a specific port (Default: 2000). This means that the **URL:** ```IP.ADDRESS:2000``` is publicly accessible via HTTP or HTTPS.
* Twilio is given a webhook (to **POST** data) too ```IP.ADDRESS:2000/sms``` (This POST request occurs when a client SMS messages the app's designated phone number)

Useful Docs:
* [Google's GTFS Documentation](https://developers.google.com/transit/gtfs) Static docs & Realtime docs.
* [Twilio's SMS Docs for Node.js](https://www.twilio.com/docs/sms/tutorials/how-to-receive-and-reply-node-js) Shows how to use their built in Messaging Response Functionality (TwiML) &amp; basic express setup.
* [MySQL2 npm Docs](https://www.npmjs.com/package/mysql2) Same link as above, very useful for setting up MySQL2 in node, and using all its functionalities.




