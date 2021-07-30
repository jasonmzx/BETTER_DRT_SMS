const mysql = require('mysql2/promise');

//Connection to Database Pool
const db = require('../database_pool.js')


const expiration = 60000

let user_auth = async (user_number) => {

    //Assigning the DB Pool object into Promise form.
    const Promise_pool = db.promise();

    //Shortening user_number input:
    user_number = user_number.slice(1,user_number.length)

    const [init_query,init_fields] = await Promise_pool.query("SELECT * FROM `users` WHERE user_number = ?",[user_number]);
    if(!init_query.length){
        await Promise_pool.execute("INSERT INTO `users` (user_number, user_expiry) VALUES (?,?)", [user_number, Date.now() + expiration]);
        return
    } else {
        //If User is expired:
        if(init_query[0].user_expiry <= Date.now()){
            //Clear all stop aliases:
            await Promise_pool.execute("DELETE FROM `stop_aliases` WHERE alias_owner = ?",[user_number]);
            //Renew expiry:
            await Promise_pool.execute("UPDATE `users` SET user_expiry = ? WHERE user_number = ?;",[Date.now() + expiration, user_number]);
            
            return [user_number, 1] //Returns user's number & expiry boolean (1 or true since he expired)
        } 
        await Promise_pool.execute("UPDATE `users` SET user_expiry = ? WHERE user_number = ?;",[Date.now() + expiration, user_number]);
    }

    return [user_number, 0] 
}

//Export Functions here
module.exports ={
    user_auth 
  }

