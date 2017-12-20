// Hive API program

var Hive = require('bg-hive-api');
var hive = new Hive("email", "password");

var ClimateControl = require('bg-hive-api/climateControl');
var Temperature = require('bg-hive-api/temperature');

var timeLabels = []
var tempData = []
 
function TemperatureEventHandler(controller) {

    if (controller != undefined)
    {    
        // Get today's temperature history
        var list = controller.GetState(controller.Period.Day);

        controller.on('update', function(data){
            console.log(data);
        });
 
        controller.on('accepted', function(){
            console.log('OK');
        });
 
        controller.on('error', function(response){
            console.log(response);
        });

        // Handle the on complete event. 
        controller.on('complete', function(response){
            console.log(response)

            // Iterate over date and temperatures
            var dataList = response.data

            for (var key in dataList) {
                var cur = dataList[key]
                timeLabels.push(cur.date)
                tempData.push(cur.temperature)
                console.log("Date: " + cur.date + ", Temp: " + cur.temperature)
            }

            var http = require('http');
            var fs = require('fs');

            // Create new server to view chart
            http.createServer(function (req, response) {

                fs.readFile('hivechart.html', 'utf-8', function (err, data) {
                    response.writeHead(200, { 'Content-Type': 'text/html' });
                    var updated = data.replace('{{labelData}}', JSON.stringify(timeLabels))
                                     .replace('{{chartData}}', JSON.stringify(tempData));

                    response.write(updated);
                    response.end();
                });
            }).listen(8080, '127.0.0.1');

            console.log('Server running at http://127.0.0.1:8080/');
        });
    }
}

function ClimateEventHandler(controller) {

    if (controller != undefined)
    {    
        // write the response state object to the console.   
        controller.GetState();

        controller.on('update', function(data){
            console.log(data);
        });
 
        controller.on('accepted', function(){
            console.log('OK');
        });
 
        controller.on('error', function(response){
            console.log(response);
        });

        // Handle the on complete event. 
        controller.on('complete', function(response){
            console.log(response);
        });
    }
}


// on successful login this event handler is called 
hive.on('login', function(context){

    console.log('Connected');

    // Create an instance of the climate controller 
    var climate = new ClimateControl(context);

    // Create an instance of the temperature history controller 
    var temp = new Temperature(context);
 
    //ClimateEventHandler(climate);
    TemperatureEventHandler(temp);

    hive.Logout();  
});


// on logout call this event handler 
hive.on('logout', function(){
   console.log('Connection Closed');
});
 
// on invalid username or password 
hive.on('not_authorised', function(){
   console.log('Connection Refused');
});
 

//Log in 
hive.Login();