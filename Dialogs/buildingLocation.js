var builder = require('botbuilder');
var request = require('sync-request');
module.exports = function(bot){
bot.dialog('/buildingLocation',[
    function(session,args,next){
        session.dialogData = args;
        /*var building = builder.EntityRecognizer.findEntity(args.entities,'location_name');
        //var address = builder.EntityRecognizer.findEntity(args.entities,'Address');
        location_index.search(buildingName,function searchDone(err,content){
        if (err){
            console.error(err);
        }
        next({response : content.hits[0]})
    });
},
    function(session,results){
        session.dialogData.angolia_results = results.response;*/
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
            builder.CardAction.openUrl(session, "https://maps.google.com/maps/dir//"+ mapData.formatted_address,'click here to open it in google maps')]);

        var msg = new builder.Message(session).addAttachment(card);
        //var building = builder.EntityRecognizer.findEntity(session.dialogData.luis_data.entities,'location_name');
        
        session.sendTyping();
        session.send(mapData.title+' is located at '+mapData.formatted_address);
        session.sendTyping();
        session.send(msg);
        session.endDialog();
    }
]);
};