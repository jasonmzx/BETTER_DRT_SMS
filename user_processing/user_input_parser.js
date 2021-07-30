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
    
    //Splitting & Filtering Command string for any excess spaces:
    user_input.command = (user_input.command).split` `.filter(elm => elm)
    
    const prefixSetting = {
        realtime_fetch : "@", //action: 1
        static_fetch : "!", //action: 2
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
            if(isNaN(user_input.command[1])){ return {error_msg: "Route Filter is invalid."}}

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

        console.log(await input_fetch_validation(1))
        return await input_fetch_validation(1) //Realtime Fetch (action: 1)

    } else if(user_input.prefix == prefixSetting.static_fetch) {

        console.log(await input_fetch_validation(2))
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



    }


}

console.log(input_parse('  $ 2242   900','12899282058'));