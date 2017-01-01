var builder = require('botbuilder');
var restify = require('restify');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log("%s listening to %s", server.name, server.url);
});
server.get(/.*/, restify.serveStatic({
	'directory': '.',
	'default': 'index.html'
}));

// Create Chat Bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector, {
    persistConversationData: true // need persistent data for dictionary
});
server.post('/api/messages', connector.listen());

// Create LUIS recognizer that points at our model and add it as the root '/' dialog
var model = 'https://api.projectoxford.ai/luis/v2.0/apps/1c43280a-d40a-4538-a333-663bb7aafc66?subscription-key=6a8e724ea06b480a9f66298043bca30c&verbose=true';
var recognizer = new builder.LuisRecognizer(model);
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', dialog);

// Add intent handlers
dialog.matches('LFM', [
    function(session, args, next) {
        var language = builder.EntityRecognizer.findEntity(args.entities, 'Language');
        next({ response: language });
    },
    function(session, results) {
        // var reply = new builder.Message()
        //             .address(session.message.address)
        //             .text("Hi");
        //         bot.send(reply);

        if (!session.conversationData['LFG']) {
            session.conversationData['LFG'] = {};
        }
        if (!session.conversationData['LFM']) {
            session.conversationData['LFM'] = {};
        }

        var reply = "";

        // Greet the user
        if(session.conversationData['LFM'][session.message.address.user.name] == undefined) {
            reply += ("Nice to meet you " + session.message.address.user.name + "! ");
        }
        else {
            reply += ("Welcome back " + session.message.address.user.name + "! ");
        }

        // Check user's request
        if(results.response && results.response.entity != "") {
            reply += ("We will help you find members that know " + results.response.entity + ".");
        }
        else {
            reply += "We will help you find members.";
        }

        session.send(reply);

        // Save user's request to dictionary
        if(results.response && results.response.entity != "") {
            session.conversationData['LFM'][session.message.address.user.name] = results.response.entity;
        }
        else {
            session.conversationData['LFM'][session.message.address.user.name] = "";
        }

        var count = 0;
        for (var key in session.conversationData['LFG']) {
            if(!results.response || results.response.entity == "") {
                session.send("- " + key);
                count++;
            }
            else if(session.conversationData['LFG'][key] == results.response.entity) {
                session.send("- " + key);
                count++;
            }
        }

        if (count == 1) {
            session.endDialog("1 match found.");
        }
        else {
            session.endDialog(count + " matches found.");
        }
        
    }
]);

dialog.matches('LFG', [
    function(session, args, next) {
        var match;
        var language = builder.EntityRecognizer.findEntity(args.entities, 'Language');
        next({ response: language });
    },
    function(session, results) {
        var reply = "";

        if (!session.conversationData['LFG']) {
            session.conversationData['LFG'] = {};
        }
        if (!session.conversationData['LFM']) {
            session.conversationData['LFM'] = {};
        }


        // Greet the user
        if(session.conversationData['LFG'][session.message.address.user.name] == undefined) {
            reply += ("Nice to meet you " + session.message.address.user.name + "! ");
        }
        else {
            reply += ("Welcome back " + session.message.address.user.name + "! ");
        }

        // Check user's request
        if(results.response && results.response.entity != "") {
            reply += ("We will help you find teams that want members that know " + results.response.entity + ".");
        }
        else {
            reply += "We will help you find teams that want more members.";
        }

        session.send(reply);

        // Save user's request to dictionary
        if(results.response && results.response.entity != "") {
            session.conversationData['LFG'][session.message.address.user.name] = results.response.entity;
        }
        else {
            session.conversationData['LFG'][session.message.address.user.name] = "";
        }

        var count = 0;
        for (var key in session.conversationData['LFM']) {
            if(!results.response || results.response.entity == "") {
                session.send("- " + key);
                count++;
            }
            else if(session.conversationData['LFM'][key] == results.response.entity) {
                session.send("- " + key);
                count++;
            }
        }

        if (count == 1) {
            session.endDialog("1 match found.");
        }
        else {
            session.endDialog(count + " matches found.");
        }
    }
]);

dialog.onDefault(builder.DialogAction.send("I'm sorry I didn't understand."));