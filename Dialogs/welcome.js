module.exports = function(bot){
    bot.dialog('/welcome',[
    function (session,args,next){
        session.sendTyping();
        session.send('Hi, I am Steve the location bot for Stevens. You can ask me any location based question related to Stevens like where is the library? or where can i find BC320?.');
        session.endDialog();
    }
]);


};