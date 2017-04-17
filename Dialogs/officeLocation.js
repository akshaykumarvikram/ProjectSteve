
var builder = require('botbuilder');
module.exports = function(bot){
bot.dialog('/officeLocation',[
    function(session,args,next){
        session.dialogData = args;
       /* var building = builder.EntityRecognizer.findEntity(args.entities,'location_name');
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
        builder.Prompts.choice(session,session.dialogData.luis_data.entities.entity+" is located in "+session.dialogData.angolia_results.formatted_address+". Do you want a google map with directions for the location?","Yes|No");
    },
    function(session,results){
        if(results.response=='No'){
            session.endDialog('Ok, Have a good day!');
        }else {
        url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='+session.dialogData.angolia_results.latitude+','+session.dialogData.angolia_results.longitude+'&key=AIzaSyDRgPSaSxbTWjz8pGU2uRkW6iHd1uBp2AQ';
        var googleRequest = request('GET',url);
        var text = JSON.parse(googleRequest.getbody('utf-8'));
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
};