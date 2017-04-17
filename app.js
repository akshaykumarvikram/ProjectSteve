
var builder = require('botbuilder');
var https = require('https');
var querystring = require('querystring')
var restify = require('restify');
//var locationDialog = require('botbuilder-location');
var algoliasearch = require('algoliasearch');
var request = require('sync-request')

var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/5bbe2f1f-fda0-4c62-8b8e-ebf0cebff9a2?subscription-key=42429861bf2a47619444bbc392835c15&timezoneOffset=0.0&verbose=true&spellCheck=false&q='

var angolia_Client = algoliasearch('JN5NIQVNJZ', 'dd9e5d91cd5b1d46c335dc6a9a28b892');
var location_index = angolia_Client.initIndex('locations_index');



var connector = new builder.ChatConnector(//{
   // appId: process.env.MICROSOFT_APP_ID,
   // appPassword: process.env.MICROSOFT_APP_PASSWORD
//}
);

var bot = new builder.UniversalBot(connector);

var recognizer = new builder.LuisRecognizer(model)
var intents = new builder.IntentDialog({recognizers: [recognizer]});

const dialog = {
    welcome: require('./Dialogs/welcome'),
    buildingLocation: require('./Dialogs/buildingLocation'),
    testclassLocation: require('./Dialogs/testclassLocation'),
    ShuttleServices: require('./Dialogs/ShuttleServices'),
    confused: require('./Dialogs/confused.js')
};

intents.matches('Greetings','/welcome');
intents.matches('Locations','/Locations');
intents.matches('FAQ','/FAQ');
intents.matches('ShuttleServices','/ShuttleServices')
intents.onDefault('/confused');

bot.dialog('/',intents);
dialog.welcome(bot);
dialog.buildingLocation(bot);
dialog.testclassLocation(bot);
dialog.ShuttleServices(bot);
dialog.confused(bot);


bot.dialog('/Locations',[
    function(session,args,next){
        session.dialogData.luis_data = args;

        var location_name = builder.EntityRecognizer.findEntity(args.entities,'location_name');
         location_index.search(location_name.entity,function searchDone(err,content){
        if (err){
            console.error(err);
        }
        console.log(content.hits)   
        next({response : content.hits[0]})
    });
}, function(session,results){
    session.dialogData.algolia_data = results.response;
    var category = results.response.category;
    console.log(category);
        switch (category){
            case 'building':
                session.beginDialog('/buildingLocation',session.dialogData);
                break;
            case 'office':
                bot.beginDialog('/officeLocation',session.dialogData);
                break;
            case 'classroom':
                console.log('classroom executed');
                session.beginDialog('/testclassLocation',session.dialogData);   
                break;
            default:
                session.endDialog('Sorry, I don\'t have that location in my knowledge base. Please ask me anything else or try again later');
                break; 
        }
            
     session.endDialog()   
    }
]);

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});
server.post('/api/messages', connector.listen());



function createHeroCard(session,mapData) {
    console.log('map address:'+mapData.formatted_address)
    return new builder.HeroCard(session)
        .title(mapData.title)
        .subtitle(mapData.subtitle)
        .text('')
        .images([
            builder.CardImage.create(session, 'https://maps.googleapis.com/maps/api/staticmap?center='+mapData.lat+','+mapData.lng+'&markers=markers=color:blue%7Clabel:S%7C'+mapData.lat+','+mapData.lng+'&zoom=12&size=400x400&key=AIzaSyC_Bs4TTCXKrwKpgEKpgCu3AnB9Vs6F1qw')
        ])
        .tap([
            builder.CardAction.openUrl(session, "https://maps.google.com/maps/dir//"+ mapData.formatted_address,'click here to open in google maps')
        ]);
}

bot.dialog('/testfunc',[
    function(session,args,next){
        session.endDialog('this function is triggered');
    }
]);