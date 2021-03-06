

var builder = require('botbuilder');
var https = require('https');
var querystring = require('querystring')
var restify = require('restify');

var algoliasearch = require('algoliasearch');
var request = require('sync-request')

var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/5bbe2f1f-fda0-4c62-8b8e-ebf0cebff9a2?subscription-key=42429861bf2a47619444bbc392835c15&timezoneOffset=0.0&verbose=true&spellCheck=false&q='

var algolia_Client = algoliasearch('JN5NIQVNJZ', 'dd9e5d91cd5b1d46c335dc6a9a28b892');
var location_index = algolia_Client.initIndex('locations_index');



var connector = new builder.ChatConnector({
   appId: '1716751e-b063-48e2-8e34-737258773ebf',
   appPassword: 'skXdUONeuF81iDjmLvjMn4N'
}
);

var bot = new builder.UniversalBot(connector);

var recognizer = new builder.LuisRecognizer(model)
var intents = new builder.IntentDialog({recognizers: [recognizer]});

const dialog = {
    welcome: require('./Dialogs/welcome'),
    Locations: require('./Dialogs/Locations'),
   // classLocation: require('./Dialogs/classLocation'),
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
dialog.Locations(bot);
//dialog.classLocation(bot);
dialog.ShuttleServices(bot);
dialog.confused(bot);


bot.dialog('/LLocations',[
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
}, function(session,results,next){
    session.dialogData.algolia_data = results.response;
    var category = results.response.category;
    if(category == 'building'){
        next({response: 'Yes'});
    }else if(category == 'office' || category == 'classroom'){
        query = session.dialogData.algolia_data.location_name +"is located at "+session.dialogData.algolia_data.address+"\n would you like directions for this locations.";
        builder.Prompts.choice(session,query,['Yes','No'],{listStyle: builder.ListStyle.button});
    }else {
        session.endDialog('Sorry, we dont have that location in our knowledge base');
    }
       
},
    function(session, results){
        if(results.response.entity == 'No'){
            session.endDialog("Ok, Have a good day.");
        } else {
         console.log('---------------'+session.dialogData.algolia_data.latitude+"++++++++++++++"+session.dialogData.algolia_data.longitude)
         url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='+session.dialogData.algolia_data.latitude+','+session.dialogData.algolia_data.longitude+'&key=AIzaSyDRgPSaSxbTWjz8pGU2uRkW6iHd1uBp2AQ'
        var googleRequest = request('GET',url);
        var text = JSON.parse(googleRequest.getBody('utf-8'));
        mapData = {};
        mapData.lat = session.dialogData.algolia_data.latitude;
        mapData.lng = session.dialogData.algolia_data.longitude;
        mapData.formatted_address = text.results[0].formatted_address;
        mapData.title = session.dialogData.algolia_data.location_name;
        mapData.subtitle = session.dialogData.algolia_data.address
        mapData.text = session.dialogData.algolia_data.info;
       
        var card = new builder.HeroCard(session)
            .title(mapData.title)
            .subtitle(mapData.address)
            .text(mapData.text)
            .images([
                builder.CardImage.create(session, 'https://maps.googleapis.com/maps/api/staticmap?center='+mapData.lat+','+mapData.lng+'&markers=markers=color:blue%7Clabel:S%7C'+mapData.lat+','+mapData.lng+'&zoom=12&size=400x400&key=AIzaSyC_Bs4TTCXKrwKpgEKpgCu3AnB9Vs6F1qw')
            ])
            .buttons([
            builder.CardAction.openUrl(session, "https://maps.google.com/maps/dir//"+ mapData.formatted_address,'click here for directions')]);

        var msg = new builder.Message(session).addAttachment(card);
        //var building = builder.EntityRecognizer.findEntity(session.dialogData.luis_data.entities,'location_name');
        
        session.sendTyping();
        session.send(mapData.title+' is located at '+mapData.formatted_address);
        session.sendTyping();
        session.send(msg);
        session.endDialog();
    
        }
    }
]);



// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});
server.post('/api/messages', connector.listen());


