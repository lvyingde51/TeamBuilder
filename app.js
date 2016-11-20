var builder = require('botbuilder');
var restify = require('restify');

// Dictionaries
var LFMdictionary = {};
var LFGdictionary = {};

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log("%s listening to %s", server.name, server.url);
});

// Create Chat Bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
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
        session.send("LFM request detected");
        if(results.response) {
            session.send("Selected Language: " + results.response.entity);
        }
        else {
            session.send("No language selected");
        }
        
        session.send("This is " + session.message.address.user.id);
        if(LFMdictionary[session.message.address.user.id] != undefined) {
            session.send("This userID already exists.");
        }
        LFMdictionary[session.message.address.user.id] = results.response.entity;       

        for (var key in LFGdictionary) {
            if(LFGdictionary[key] == results.response.entity) {
                session.send("Match found: " + key);
            }
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
        session.send("LFG request detected");
        if(results.response) {
            session.send("Selected Language: " + results.response.entity);
        }
        else {
            session.send("No language selected");
        }

        session.send("This is " + session.message.address.user.id);
        if(LFGdictionary[session.message.address.user.id] != undefined) {
            session.send("This userID already exists.");
        }
        LFGdictionary[session.message.address.user.id] = results.response.entity;

        for (var key in LFMdictionary) {
            if(LFMdictionary[key] == results.response.entity) {
                session.send("Match found: " + key);
            }
        }
    }
]);

dialog.onDefault(builder.DialogAction.send("I'm sorry I didn't understand."));