//Imported libs

//Local files
const db = require('../database_pool.js')

/*
list of commands:

@<stop_id> or <alias> //realtime stop_id fetch
@<stop_id> or <alias> <route_filter> ^

!<stop_id> or <alias> //static stop_id fetch
!<stop_id> or <alias> <route_filter> ^

$<stop_id> <alias>

$$ //list of all aliases 
*/

//Input parser is ASYNC because it requires a Database query for aliases (created by users)
let input_parse = async (user_input,user_number) => {

    user_input = user_input.trim();

    //Prefix (@,! or $) , Command
    user_input = {
        prefix: user_input.slice(0,1) , 
        command: user_input.slice(1,user_input.length)}; 
    
    console.log(user_input.prefix);
    //Splitting & Filtering Command string for any excess spaces:
    user_input.command = (user_input.command).split` `.filter(elm => elm)
    
    const prefixSetting = {
        realtime_fetch : "@", //action: 1
        static_fetch : "#", //action: 2
        favorite : "$" //action: 3
    }

    //Assigning the DB Pool object into Promise form.
    const Promise_pool = db.promise();

        //realtime & static fetch:
        let input_fetch_validation = async (action_type) => {
            //Number of arguments checker:
            if(user_input.command.length > 2 || !(user_input.command.length) ){
                return {error_msg: 'Invalid amount of arguments.'}
            }
            
            //Make sure route_filter is an integer
            if(user_input.command[1] && isNaN(user_input.command[1])){ return {error_msg: "Route Filter is invalid."}}

            if(isNaN(user_input.command[0])){
                //Check if Favorite (alias) Exists query:
                const[res,inf] = 
                await Promise_pool.query(`SELECT * FROM stop_aliases WHERE alias_owner = ? AND alias = ?`,
                [user_number,user_input.command[0]])

                //Response isn't empty: (alias exists)
                if(res.length){
                    return {
                        action: action_type,
                        stop_id: res[0].stop_id|0,
                        route_filter: user_input.command[1] ? user_input.command[1]|0 : null 
                    }
                } else {
                    return {error_msg: 'Alias not found.'}
                }   

            } else {
                //Check if StopID exists:
                const[res,inf] = await Promise_pool.query(`SELECT * FROM stops WHERE stop_id = ?`,[user_input.command[0]])

                if(res.length){
                    return {
                        action: action_type,
                        stop_id: user_input.command[0]|0,
                        route_filter: user_input.command[1] ? user_input.command[1]|0 : null 
                    }
                } else {
                    return {error_msg: 'Invalid stop.'}
                }
            }
            
        };


    if(user_input.prefix == prefixSetting.realtime_fetch){
        console.log("realtime")
        return await input_fetch_validation(1) //Realtime Fetch (action: 1)

    } else if(user_input.prefix == prefixSetting.static_fetch) {
        console.log("static")
        return await input_fetch_validation(2) //Static Time Fetch (action: 2)

    } else if(user_input.prefix == prefixSetting.favorite){
        //Make sure it's just stop and alias
        if(user_input.command.length != 2){
            return {error_msg: 'Invalid amount of arguments.'}
        }    

        //Alias must be isNaN() == true
        if(!(isNaN(user_input.command[1]))){
            return {error_msg: 'Alias must contain atleast 1 alphabetical character'}
        }

        //Check if StopID exists:
         const[res,inf] = await Promise_pool.query(`SELECT * FROM stops WHERE stop_id = ?`,[user_input.command[0]])
        console.log(res);
        if(!res.length){
            return {error_msg: `Stop ID not found.`}
        }

        //Check Stop Aliases (Favorites List) if entry exists:
        const[fav_res,fav_inf] = await Promise_pool.query('SELECT * FROM `stop_aliases` WHERE alias_owner = ? AND stop_id = ? OR alias = ?',
        [user_number,user_input.command[0],user_input.command[1]]
        );
        console.log(fav_res);

        if(fav_res.length){
            await Promise_pool.execute(`UPDATE stop_aliases SET stop_id = ?, alias = ? WHERE alias_owner = ? AND stop_id = ? AND alias = ?`,
            [user_input.command[0], user_input.command[1], user_number, fav_res[0].stop_id|0 , fav_res[0].alias   ]);


            if(fav_res.length >= 2){
                await Promise_pool.execute(`DELETE FROM stop_aliases WHERE stop_id = ? AND alias = ? AND alias_owner = ?`,[
                    fav_res[1].stop_id , fav_res[1].alias , fav_res[1].alias_owner
                ]);
            }
            return `Updated Favorite!\n\n@ ${user_input.command[1]} \nCorresponding Stop: ${user_input.command[0]}\n\nPreviously known as:\n( ${fav_res[0].alias} )`
            //Updated message, old stop to new
        } else {
            await Promise_pool.execute(`INSERT INTO stop_aliases (stop_id, alias, alias_owner) VALUES (?,?,?)`, 
            [user_input.command[0],user_input.command[1], user_number ])
            return `New Favorite created! \n ${user_input.command[1]}`
        }



    }


}

module.exports = {
    input_parse
}