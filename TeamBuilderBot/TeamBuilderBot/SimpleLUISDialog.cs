using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Builder.Luis;
using System.Threading.Tasks;
using Microsoft.Bot.Builder.Luis.Models;
using Microsoft.Bot.Connector;

namespace TeamBuilderBot {
     [LuisModel("1c43280a-d40a-4538-a333-663bb7aafc66", "6a8e724ea06b480a9f66298043bca30c")]
     [Serializable]
     public class SimpleLUISDialog : LuisDialog<object> {
          [LuisIntent("LFM")]
          public async Task LFM(IDialogContext context, LuisResult result) {
               
               Dictionary<string, string> LFMdictionary = context.ConversationData.Get<Dictionary<string, string>>("LFMdictionary");
               EntityRecommendation rec;
               string language = "";
               string userID = context.UserData.Get<string>("userID");

               // If Language is specified, update Language
               if (result.TryFindEntity("Language", out rec)) {
                    language = rec.Entity;
               }

               // Add or Edit request
               if (LFMdictionary.ContainsKey(userID)) {
                    LFMdictionary[userID] = language;
                    await context.PostAsync($"Request edited. (Language: {language})");
                    //context.Wait(MessageReceived);
               }
               else {
                    LFMdictionary[userID] = language;
                    //LFMdictionary.Add(userID, language);
                    await context.PostAsync($"Request added. (Language: {language})");
                    //context.Wait(MessageReceived);
               }

               // List all Teams satisfying the condition
               Dictionary<string, string> LFGdictionary = context.ConversationData.Get<Dictionary<string, string>>("LFGdictionary");
               
               foreach (KeyValuePair<string, string> pair in LFGdictionary) {
                    if (pair.Value == language) {
                         await context.PostAsync($"{pair.Key}");
                         //context.Wait(MessageReceived);
                    }
               }

               await context.PostAsync($"{LFGdictionary.Count}");
               context.Wait(MessageReceived);
          }

          [LuisIntent("LFG")]
          public async Task LFG(IDialogContext context, LuisResult result) {
               Dictionary<string, string> LFGdictionary = context.ConversationData.Get<Dictionary<string, string>>("LFGdictionary");
               EntityRecommendation rec;
               string language = "";
               string userID = context.UserData.Get<string>("userID");
               
               // If Language is specified, update Language
               if (result.TryFindEntity("Language", out rec)) {
                    language = rec.Entity;
               }

               // Add or Edit request
               if (LFGdictionary.ContainsKey(userID)) {
                    LFGdictionary[userID] = language;
                    await context.PostAsync($"Request edited. (Language: {language})");
                    //context.Wait(MessageReceived);
               }
               else {
                    LFGdictionary[userID] = language;
                    //LFGdictionary.Add(userID, language);
                    await context.PostAsync($"Request added. (Language: {language})");
                    //context.Wait(MessageReceived);
               }
               
               // List all Members satisfying the condition
               Dictionary<string, string> LFMdictionary = context.ConversationData.Get<Dictionary<string, string>>("LFMdictionary");

               foreach (KeyValuePair<string, string> pair in LFMdictionary) {
                    if (pair.Value == language) {
                         await context.PostAsync($"{pair.Key}");
                         //context.Wait(MessageReceived);
                    }
               }
               
               await context.PostAsync($"Count: {LFMdictionary.Count}");
               context.Wait(MessageReceived);
               
          }

          [LuisIntent("")]
          public async Task None(IDialogContext context, LuisResult result) {
               await context.PostAsync("Unrecognizable command.");
               context.Wait(MessageReceived);
          }
     }
}