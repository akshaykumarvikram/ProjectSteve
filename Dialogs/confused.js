module.exports = function(bot){
    bot.dialog('/confused',[
    function (session,args,next){
        session.sendTyping();
        session.send('Sorry, that is out of my scope. Please ask me something related to Locations on stevens campus.');
        session.endDialog();
    }
]);

};