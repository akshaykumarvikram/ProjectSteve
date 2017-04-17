var builder = require('botbuilder');
var https = require('https')
var querystring = require('querystring')
var restify = require('restify');
var locationDialog = require('botbuilder-location');
var algoliasearch = require('algoliasearch');
var request = require('request')

var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/5bbe2f1f-fda0-4c62-8b8e-ebf0cebff9a2?subscription-key=42429861bf2a47619444bbc392835c15&timezoneOffset=0.0&verbose=true&spellCheck=true&q='
var recognizer = new builder.LuisRecognizer(model)
var dialog = new builder.IntentDialog({recognizers: [recognizer]});
var angolia_Client = algoliasearch('JN5NIQVNJZ', 'dd9e5d91cd5b1d46c335dc6a9a28b892');
var index = angolia_Client.initIndex('Building Locations');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

var connector = new builder.ChatConnector(//{
   // appId: process.env.MICROSOFT_APP_ID,
   // appPassword: process.env.MICROSOFT_APP_PASSWORD
//}
);

var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

BING_MAPS_API_KEY = 'AtIB1tPqY8_fz1OV799RCy2JlqEpPxDqdJJHA_Y-MON8cjIqfJszXuZ7NJe6nqP1'
GOOGLE_STATIC_MAPS_KEY = 'AIzaSyC_Bs4TTCXKrwKpgEKpgCu3AnB9Vs6F1qw'
bot.library(locationDialog.createLibrary(BING_MAPS_API_KEY));

bot.dialog('/', dialog);
module.exports = dialog
    .matches('Greetings',function(session){
        session.send('Hi, I am Steve. Navigation bot for stevens institute of tech. Type where you want to go. Eg. Where is BC320? or Where can i find the library')
    })  
    .matches('findBuildingLocation',[
        searchForLocation, getCoordinates, getMap
    ])
    .onDefault(function (session){
        session.send('I didn\'t understand. Say hello to me!')
    });

function searchForLocation(session,args,next){
    session.dialogData.entities = args.entities;
    var buildingName = builder.EntityRecognizer.findEntity(args.entities,'BuildingName');
    if(buildingName){
        next({ response : buildingName.entity})
    }
}
function getCoordinates(session,results,next){
    buildingName = results.response;
    index.search(buildingName,function searchDone(err,content){
        if (err){
            console.error(err);
        }
        next({response : content.hits[0]})
    });

}
function getMap(session,results){
    mapData = {}
    console.log(results.response)
    mapData.nameOfBuilding = results.response.Building;
    mapData.lat = results.response.Latitude;
    mapData.lng = results.response.Longitude;

    url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='+mapData.lat+','+mapData.lng+'&key=AIzaSyDRgPSaSxbTWjz8pGU2uRkW6iHd1uBp2AQ'
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
    //console.log(mapData.address)
    var card = createHeroCard(session,mapData)
    var msg = new builder.Message(session).addAttachment(card);
    session.send(msg);
    session.endDialog();
});
    //console.log(mapData)
    //var card = createHeroCard(session,mapData)
    //var msg = new builder.Message(session).addAttachment(card);
    //session.send(msg);
    //session.endDialog();


}    


//bot.dialog('/',[
   // function(session){
      //  var options= {
       //     prompt: "What is that you are searching for?",
            //requiredFields:
            //    locationDialog.LocationRequiredFields.streetAddress |
            //    locationDialog.LocationRequiredFields.locality |
            //    locationDialog.LocationRequiredFields.region == 'NJ'|
            //    locationDialog.LocationRequiredFields.postalCode == '07030'
      //  };

     //   locationDialog.getLocation(session, options);
    //},
    //function (session, results) {
        //if (results.response) {
           // var place = results.response;
            //var card = createHeroCard(session)
            //var msg = new builder.Message(session).addAttachment(card);
            //session.send(msg);
       // }
   // }
//]);

function createHeroCard(session,mapData) {
    console.log('map address:'+mapData.address)
    return new builder.HeroCard(session)
        .title(mapData.Building)
        .subtitle(mapData.address)
        .text('')
        .images([
            builder.CardImage.create(session, 'https://maps.googleapis.com/maps/api/staticmap?center='+mapData.lat+','+mapData.lng+'&markers=markers=color:blue%7Clabel:S%7C'+mapData.lat+','+mapData.lng+'&zoom=12&size=400x400&key=AIzaSyC_Bs4TTCXKrwKpgEKpgCu3AnB9Vs6F1qw')
        ])
        .buttons([
            builder.CardAction.openUrl(session, "https://maps.google.com/maps/dir//"+ mapData.address,'click here to open in google maps')
        ]);
}
//https:// https://maps.googleapis.com/maps/api/staticmap?center=40.714728,-73.998672&zoom=12&size=400x400&key=AIzaSyC_Bs4TTCXKrwKpgEKpgCu3AnB9Vs6F1qw
//"https://www.google.com/maps/embed/v1/place?key=AIzaSyAosOQVRLKcmZPmXCXEYT7kOv3xBHiX4IE&q=40.714728,-73.998672"
//'https://maps.googleapis.com/maps/api/staticmap?center='+mapData.lat+','+mapData.lng+'&markers=markers=color:blue%7Clabel:S%7C'+mapData.lat+','+mapData.lng+'&zoom=12&size=400x400&key=AIzaSyC_Bs4TTCXKrwKpgEKpgCu3AnB9Vs6F1qw'
