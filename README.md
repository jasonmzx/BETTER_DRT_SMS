# BETTER_DRT_SMS
A better SMS (Text Message) Bus tracker &amp; Schedule for [Durham Region Transit](https://www.durhamregiontransit.com/) (Municipality of Durham's city bus service)

Tech Stack:
* This application was built on [Node.js](https://nodejs.org/en/) *(JavaScript runtime environment)* 
* The Node.js web framework [express](https://www.npmjs.com/package/express) is used to run an HTTP server. *(API Endpoint for post requests)*
* [Twilio](https://www.twilio.com/sms)  handles incoming & outgoing SMS messages. *(Sends data to express server's HTTP post endpoint)*
* This application communicates with a [MySQL Server](https://www.mysql.com/) using the Node.js library [MySQL2](https://www.npmjs.com/package/mysql2). *(continuation of MySQL-Native)*
* [JS GTFS-realtime Bindings](https://www.npmjs.com/package/gtfs-realtime-bindings) Is used to decode the realtime transit data being fetched from the [OpenData Durham](https://opendata.durham.ca/search?q=gtfs) website.
* The [date-and-time](https://www.npmjs.com/package/date-and-time) library is used to format various timetables &amp; dates.

Hosting:
* A VPS ( Ubuntu 20.04 ) with a public IPv4 Address (Secured with password for SSH access to Ubuntu CLI) is the host to both express & MySQL servers. (services) <br>

    - MySQL server is ran as a service. ```[sudo] service mysql start```  (express server connects locally to MySQL server.)

    -  Unlike MySQL, NodeJS isn't ran in the background as a service. [tmux](https://tmuxcheatsheet.com/) is used for this.  *(tmux is a terminal multiplexer used to make sub-sessions within the SSH session (terminal), when the main terminal closes, the sub-session(s) can still run)* The NodeJs express server is ran in a tmux sub-session, this runs very similarly to service.<br>**SETUP (in terminal):**<br>**1**. ``` tmux``` to create a session.<br>**2**. Run node server once in session ```node drt_sms.js```<br>**Extra CMDS**:  ``` tmux ls``` to check all sessions.<br>```tmux attach -t <session name>``` to re-connect to sessions.

    - Change Ubuntu timezone parameter since node app uses the operation system's date.<br>**>** ``` sudo timedatectl set-timezone America/New_York ```
	
Useful Docs:
* [Google's GTFS Documentation](https://developers.google.com/transit/gtfs) Static docs & Realtime docs.
* [Twilio's SMS Docs for Node.js](https://www.twilio.com/docs/sms/tutorials/how-to-receive-and-reply-node-js) Shows how to use their built in Messaging Response Functionality (TwiML) &amp; basic express setup.
* [MySQL2 npm Docs](https://www.npmjs.com/package/mysql2) Same link as above, very useful for setting up MySQL2 in node, and using all its functionalities.




