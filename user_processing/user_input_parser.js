
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
        command: ( user_input.slice(1,user_input.length) ).toLowerCase() }; 
        
    //Splitting & Filtering Command string for any excess spaces:
    user_input.command = (user_input.command).split` `.filter(elm => elm)
    
    const prefix_settings = {
        realtime_fetch : "@", //action: 1 
        static_fetch : "#", //action: 2
        favorite : "$",
        help: '?'
    }

    //Checking if the prefix is valid:
    if( !(Object.values(prefix_settings).includes(user_input.prefix))){
        return `Invalid Command!`
    }

    //Assigning the DB Pool object into Promise form.
    const Promise_pool = db.promise();

    /* 
    EXTERNAL FUNCTIONS THAT ARE CALLED IN THE APP:
    */

    //realtime & static fetch: (returns an object if successful)
        let input_fetch_validation = async (action_type) => {
            //Number of arguments checker:
            if(user_input.command.length > 2 || !(user_input.command.length) ){
                return `Invalid amount of arguments.\n\nTry something like this:\n${action_type == 1 ? prefix_settings.realtime_fetch : prefix_settings.static_fetch}<stop OR alias> <route (optional)>`
            }
            
            if(user_input.command[1]){

                const {readFile } = require('fs').promises, routes = './mysql_table_generators/STATIC_FILES'+'/routes.json';

                let route_json = await readFile(routes);

                if( !(JSON.parse(route_json).includes(parseInt(user_input.command[1]))) ){
                    return "Route Filter is invalid."
                }

            }


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
                    return 'Alias not found.'
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
                    return 'Invalid stop.'
                }
            }
            
        };

    //Alias Array Mapper
    let alias_map = (arr_query,page_index) => {
        console.log(arr_query)
        let formatted_arr =arr_query.map(elm => "* "+elm.alias+" - Stop ID: "+elm.stop_id+"\n"+elm.stop_name+'\n');
        formatted_arr = `Favorites P${page_index+1} :\n\n`+ formatted_arr.join('\n');
        return formatted_arr
    }


    if(user_input.prefix == prefix_settings.realtime_fetch){
        return await input_fetch_validation(1) //Realtime Fetch (action: 1)

    } else if(user_input.prefix == prefix_settings.static_fetch) {
        return await input_fetch_validation(2) //Static Time Fetch (action: 2)

    } else if(user_input.prefix == prefix_settings.favorite){

        //Client is checking his Alias list:
        if(user_input.command[0] == '$'){
            //If there is no number associated, default: 1
            let page_index = 0
            //Amount of aliases that will be displayed per page
            const alias_per_page = 5

            if(user_input.command[1]){
                //Edge case for negative numbers:
                if(parseInt(user_input.command[1]) < 0){return "Can't search for negative pages."}
                //Edge case for BASE(x) numbers (hexadecimals,binary,etc..):
                if(['0x', '0o', '0b', '0e' ].includes( ((user_input.command[1]).slice(0,2)).toLowerCase() )){return "No hexadecimals, octals, or binary! >:("}
            }
            if(user_input.command.length != 1 && !(isNaN(user_input.command[1])) && user_input.command[1]|0 > 0  ){
                page_index = (user_input.command[1]|0)-1
            }

            console.log(page_index)
            // const max_pages = {
            //     full_pages : Math.floor( all_res.length / alias_per_page) , 
            //     remainder: all_res.length % alias_per_page }


            const [all_res,all_inf] = await Promise_pool.query(`SELECT * FROM stop_aliases WHERE alias_owner = ? LIMIT ?,?`,[user_number,page_index*alias_per_page,alias_per_page]);
            // 0: Amount of full pages , 1 : Number of aliases remaining that can't complete a full page.

            if(all_res.length){
            return alias_map(all_res,page_index);
            } else {return 'Page not found.'}


        } 


        //Make sure it's just stop and alias
        if(user_input.command.length != 2){
            return 'Invalid amount of arguments.'
        }    

        //Alias must be isNaN() === true
        if(!(isNaN(user_input.command[1]))){
            return 'Alias must contain atleast 1 alphabetical character.'
        }

        if(user_input.command[1].length > 30 ){
            return 'Alias name must be under 30 characters.'
        }

        //Check if StopID exists:
         const[res,inf] = await Promise_pool.query(`SELECT * FROM stops WHERE stop_id = ?`,[user_input.command[0]])
        console.log(res);
        if(!res.length){
            return `Stop ID not found.`
        }

        //Check Stop Aliases (Favorites List) if entry exists:
        const[fav_res,fav_inf] = await Promise_pool.query('SELECT * FROM stop_aliases WHERE alias_owner = ? AND stop_id = ? OR alias = ?',
        [user_number,user_input.command[0],user_input.command[1]]
        );
        
        //console.log(fav_res);

        if(fav_res.length){
            await Promise_pool.execute(`UPDATE stop_aliases SET stop_id = ?, alias = ?, stop_name = ? WHERE alias_owner = ? AND stop_id = ? AND alias = ?`,
            [user_input.command[0], user_input.command[1],res[0].stop_name, user_number, fav_res[0].stop_id|0 , fav_res[0].alias   ]);


            if(fav_res.length >= 2){
                await Promise_pool.execute(`DELETE FROM stop_aliases WHERE stop_id = ? AND alias = ? AND alias_owner = ?`,[
                    fav_res[1].stop_id , fav_res[1].alias , fav_res[1].alias_owner
                ]);
            }
            return `Updated Favorite!\n\nNew Alias: ${user_input.command[1]} \nCorresponding Stop: ${user_input.command[0]}\n\nPreviously known as:\n( ${fav_res[0].alias} >> ${fav_res[0].stop_id} )`
            //Updated message, old stop to new
        } else {
            await Promise_pool.execute(`INSERT INTO stop_aliases (stop_id, alias, alias_owner, stop_name) VALUES (?,?,?,?)`, 
            [user_input.command[0],user_input.command[1], user_number,res[0].stop_name ])
            return `New Favorite created! \n\n Alias: ${user_input.command[1]}\n Corresponding Stop: ${user_input.command[0]} \n (${res[0].stop_name})`
        }


 
    } else if(user_input.prefix == prefix_settings.help){
        return `HELP SUMMARY:\n>> Incoming buses at STOP:\ntry: @<stop id>\nor: @<stop id> <route>\nExamples:\n @2569 | all incoming buses at Ajax Station (stop id: 2569 )\n`
    }


}

module.exports = {
    input_parse
}