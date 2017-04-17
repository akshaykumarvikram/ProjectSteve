var builder = require('botbuilder');
module.exports = function(bot){
    bot.dialog('/ShuttleServices',[
    function(session,args,next){
        var shuttleLine = builder.EntityRecognizer.findEntity(args.entities,'shuttleline');
        
        if(shuttleLine.entity){
            console.log('first one got executed'+ shuttleLine.entity);
            if(!('red green blue grey'.includes(shuttleLine.entity.toLowerCase()))){

                builder.Prompts.choice(session,'Sorry, we don\'t have a '+shuttleLine.entity+' line. Please choose one the following shuttle routes',["Red","Blue","Green","Grey"]);
            }else {
                next({response: shuttleLine});
            }
        }else{
            next({response: shuttleLine});
        }
    },
    function(session,results){
        var line = results.response.entity;
        var url = 'http://stevens.transloc.com/';
        var title = 'Stevens Shuttle services';
        var subtitle = "";
        if(line){
            console.log('this got executed')
            console.log(line);
            line = line.toLowerCase();
        }
        
        switch(line){
            case 'red':
                url = 'http://stevens.transloc.com/m/route/4004698';
                title = 'Red Line';
                subtitle = 'Weekdays: 5:30AM - 12:00AM,\n Saturday: 7:30AM - 2:10AM,\n Sunday: 12:00PM to 2:00AM';

                break;
            case 'green':
                url = 'http://stevens.transloc.com/m/route/4008514';
                title = 'Green Line';
                break;
            case 'grey':
                url = 'http://stevens.transloc.com/m/route/4008516';
                title = 'Grey Line';
                break;
            case 'blue':
                url = 'http://stevens.transloc.com/m/route/4004706';
                title = 'Blue Line';
                break;    
            default:
                url = 'http://stevens.transloc.com/';
                title = 'Stevens Shuttle service'
                break;
            }
        var card = new builder.HeroCard(session)
            .title (title)
            .subtitle('Weekdays: 5:30AM - 12:00AM,\n Saturday: 7:30AM - 2:10AM,\n Sunday: 12:00PM to 2:00AM')
            .text()
            .images([builder.CardImage.create(session,'https://www.stevens.edu/sites/stevens_edu/files/styles/topic_single_content_350x234/public/new_shuttle_map_0.png?itok=0JKpT-dn')])
            .tap([builder.CardAction.openUrl(session,url)]);
        session.sendTyping();
        session.send(new builder.Message(session).attachments([card]));
        session.endDialog()
        }
    
]);

};