const twilio = require("twilio");
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const twiml = new MessagingResponse();

let send_reponse = (message) => {

    twiml.message(`You've expired!`);
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());

}

module.exports = {
    twiml_resp
}