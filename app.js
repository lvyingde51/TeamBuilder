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

// Every 5 seconds, check for new registered users and start a new dialog
function sendDM(address, message) {

    // new conversation address, copy without conversationId
    var newConversationAddress = Object.assign({}, address);
    delete newConversationAddress.conversation;

    // start survey dialog
    bot.beginDialog(newConversationAddress, 'directmessage', message, (err) => {
        if (err) {
            // error ocurred while starting new conversation. Channel not supported?
            bot.send(new builder.Message()
                .text('This channel does not support this operation: ' + err.message)
                .address(address));
        }
    });
}

bot.dialog('directmessage', [
    function(session, args) {
        session.endDialog(args.text);
    }
]);

// Add intent handlers
dialog.matches('LFM', [
    function(session, args, next) {
        var language = builder.EntityRecognizer.findEntity(args.entities, 'Language');
        next({ response: language });
    },
    function(session, results) {
        if (!session.conversationData['LFG']) {
            session.conversationData['LFG'] = {};
        }
        if (!session.conversationData['LFM']) {
            session.conversationData['LFM'] = {};
        }

        var replyText = "";

        // Greet the user
        if(session.conversationData['LFM'][session.message.address.user.name] == undefined) {
            replyText += ("Nice to meet you " + session.message.address.user.name + "! ");
        }
        else {
            replyText += ("Welcome back " + session.message.address.user.name + "! ");
        }

        // Check user's request
        if(results.response && results.response.entity != "") {
            replyText += ("We will help you find members that know " + results.response.entity + ".");
        }
        else {
            replyText += "We will help you find members.";
        }

        sendDM(session.message.address, {text: replyText});

        // Save user's request to dictionary
        if(results.response && results.response.entity != "") {
            session.conversationData['LFM'][session.message.address.user.name] = results.response.entity;
        }
        else {
            session.conversationData['LFM'][session.message.address.user.name] = "";
        }

        var count = 0;
        var resultsText = "";

        for (var key in session.conversationData['LFG']) {
            if(!results.response || results.response.entity == "") {
                resultsText += "- " + key + "\n";
                count++;
            }
            else if(session.conversationData['LFG'][key] == results.response.entity) {
                resultsText += "- " + key + "\n";
                count++;
            }
        }       

        if (count == 1) {
            resultsText += "1 match found.";
        }
        else {
            resultsText += (count + " matches found.");
        }

        sendDM(session.message.address, {text: resultsText});
    }
]);

dialog.matches('LFG', [
    function(session, args, next) {
        var language = builder.EntityRecognizer.findEntity(args.entities, 'Language');
        next({ response: language });
    },
    function(session, results) {
        if (!session.conversationData['LFG']) {
            session.conversationData['LFG'] = {};
        }
        if (!session.conversationData['LFM']) {
            session.conversationData['LFM'] = {};
        }

        var replyText = "";

        // Greet the user
        if(session.conversationData['LFG'][session.message.address.user.name] == undefined) {
            replyText += ("Nice to meet you " + session.message.address.user.name + "! ");
        }
        else {
            replyText += ("Welcome back " + session.message.address.user.name + "! ");
        }

        // Check user's request
        if(results.response && results.response.entity != "") {
            replyText += ("We will help you find teams that want members that know " + results.response.entity + ".");
        }
        else {
            replyText += "We will help you find teams that want more members.";
        }

        sendDM(session.message.address, {text: replyText});

        // Save user's request to dictionary
        if(results.response && results.response.entity != "") {
            session.conversationData['LFG'][session.message.address.user.name] = results.response.entity;
        }
        else {
            session.conversationData['LFG'][session.message.address.user.name] = "";
        }

        var count = 0;
        var resultsText = "";

        for (var key in session.conversationData['LFM']) {
            if(!results.response || results.response.entity == "") {
                resultsText += "- " + key + "\n";
                count++;
            }
            else if(session.conversationData['LFM'][key] == results.response.entity) {
                resultsText += "- " + key + "\n";
                count++;
            }
        }       

        if (count == 1) {
            resultsText += "1 match found.";
        }
        else {
            resultsText += (count + " matches found.");
        }

        sendDM(session.message.address, {text: resultsText});
    }
]);

dialog.onDefault(builder.DialogAction.send("I'm sorry I didn't understand."));