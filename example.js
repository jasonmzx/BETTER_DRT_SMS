const { json } = require('express');
const fetch = require('node-fetch');
let body = { a: 1 };

//Command:
// $<stop> <unique name> <short description>
// E.G. $2242 hakim.plaza.stop The stop just infront of the hakim plaza (headed east-bound, towards whitby)

const testSet = ['$2242 hakim.plaza.stop The stop just infront of the hakim plaza (headed east-bound, towards whitby)',
                '$2241 harwood_tims',
                '$420 something',
                '$2241'

]



// fetchStop(stopId);

function CreateFavorite(inp){
//Array of command typed by Client
let inp_arr = inp.split(" ")
console.log(`Length of array is ${inp_arr.length}`)
//Numbers after $ in the first string in inp_arr (stop id)
const stop_num = inp_arr[0].slice(1,inp_arr[0].length)

if (inp_arr[0][0] == "$" && isNaN(stop_num) == false && inp_arr.length > 1 ){ 
    console.log("Valid stop number")
    const stopNum = async (stop_num) => {
        let body = {a:1};
        const data = 
        { method: 'post',
          body: JSON.stringify(body),
          headers:  { 'Content-Type': 'application/json' },
        }
        return fetch(`https://www.durhamregiontransit.com/Modules/NextRide/services/GetStopTimes.ashx?stopId=${stop_num}`, data)
        .then(res => res.json())
        .catch((error) => null )
        
    }
    stopNum(stop_num).then(function(result){
         if (result == null){ //API Throws error (invalid user input)
         return null
         } 
         //Successful response from API
         else {
                const FormattedData = {
                'stop_name': result.Name,
                'stop_id' : result.StopId,
                'stop_nickname' : inp_arr[1],
                'stop_description' : inp.slice(inp_arr[0].length + inp_arr[1].length+2,inp.length)
                }
            console.log(`${result.Name} & ${result.StopId}`);
            console.log(FormattedData);
            }
        
        })
    


    } // The end of IF

} // End of CreateFavorite

// const stopNum = async (stop_num) => {
//     let body = {a:1};
//     const data = 
//     { method: 'post',
//       body: JSON.stringify(body),
//       headers:  { 'Content-Type': 'application/json' },
//     }
//     return fetch(`https://www.durhamregiontransit.com/Modules/NextRide/services/GetStopTimes.ashx?stopId=${stop_num}`, data)
//     .then(res => res.json())
    
// }

// console.log(stopNum(2242).then(function(result) {
//     console.log(result); // "Some User token"
//     console.log("this executed")
//  }));

testSet.forEach(element => {
    console.log("hello?")
    let test = CreateFavorite(element);
})