let routes_generate = async (static_file_path) => {
    const fs = require('fs');
    const {readFile } = require('fs/promises'), routes = static_file_path+'/routes.txt';

    //File rows
    let routes_data = (await readFile(routes,'utf8')).split('\n').slice(1,-1);

    //Filtered just the route number:
    let routes_filt = routes_data.map(route => route.split(',')[0]|0 ); 

    try {
        //Check if file exists (try & catch)
        file_cont = fs.readFileSync(static_file_path+'/routes.json');

        fs.writeFileSync(static_file_path+'/routes.json', JSON.stringify(routes_filt));
        console.log('Updated existing routes.json file...')


    } catch(err){
        if(err.code == 'ENOENT'){
            console.log('Creating routes.json & file content...')
            fs.writeFileSync(static_file_path+'/routes.json',JSON.stringify(routes_filt));


        }
    }

    console.log('Completed!')


}

module.exports = {
    routes_generate
}