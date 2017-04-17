var builder = require('botbuilder');
var request = require('sync-request');
module.exports = function(bot){
    bot.dialog('/testclassLocation',[
        function(session,args,next){
            session.dialogData = args;
           // session.send("The class "+session.dialogData.algolia_data.location_name+" is located in "+session.dialogData.algolia_data.address);
           session.sendTyping();
           builder.Prompts.choice(session,"The class "+session.dialogData.algolia_data.location_name+" is located in "+session.dialogData.algolia_data.address+"Do you want directions for this location?",["Yes","No"],{listStyle: builder.ListStyle.button});
        },
        function(session,results){
            if(results.response == 'No'){
                session.endDialog('Ok, have a good day.')
            } else {
                 url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='+session.dialogData.angolia_results.latitude+','+session.dialogData.angolia_results.longitude+'&key=AIzaSyDRgPSaSxbTWjz8pGU2uRkW6iHd1uBp2AQ';
        var googleRequest = request('GET',url);
        console.log(googleRequest.getBody());
        var text = JSON.parse(googleRequest.getBody('utf-8'));
        mapData = {};
        mapData.lat = session.dialogData.angolia_results.latitude;
        mapData.lng = session.dialogData.angolia_results.longitude;
        mapData.formatted_address = text.results[0].formatted_address;
        mapData.title = session.dialogData.angolia_results.location_name;
        mapData.subtitle = session.dialogData.angolia_results.address
        mapData.text = session.dialogData.angolia_results.info;
        var card = new builder.HeroCard(session)
            .title(mapData.title)
            .subtitle(mapData.address)
            .text(mapdata.text)
            .images([
                builder.CardImage.create(session, 'https://maps.googleapis.com/maps/api/staticmap?center='+mapData.lat+','+mapData.lng+'&markers=markers=color:blue%7Clabel:S%7C'+mapData.lat+','+mapData.lng+'&zoom=12&size=400x400&key=AIzaSyC_Bs4TTCXKrwKpgEKpgCu3AnB9Vs6F1qw')
            ])
            .buttons([
            builder.CardAction.openUrl(session, "https://maps.google.com/maps/dir//"+ mapData.formatted_address,'click here to open it in google maps')]);

        var msg = new builder.Message(session).addAttachment(card);
        //var building = session.dialogData.angolia_results.location_name;
        
       // session.sendTyping();
       // session.send(building+' is located at '+mapdata.formatted_address);
        session.sendTyping();
        session.send(msg);
        session.endDialog();
            }
        }
    ]);
}   