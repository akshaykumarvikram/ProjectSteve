
var request = require('request')
//var json = require('JSON')
mapData = {'result' : 'addss'}
url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=40.742954,-74.026701&key=AIzaSyDRgPSaSxbTWjz8pGU2uRkW6iHd1uBp2AQ'
function rgeocode(url,mapData,fn){
    request(url,function(err,response,body){
        //console.log('sd'+ mapData)
        mapData.address = body;
        fn(body)
    });
}
rgeocode(url,mapData,function(address){
    text = JSON.parse(address);
    //console.log(mapData)
    mapData.address =  text.results[0].formatted_address;
    //console.log(mapData)
    console.log(mapData.address)
});
//console.log(x)