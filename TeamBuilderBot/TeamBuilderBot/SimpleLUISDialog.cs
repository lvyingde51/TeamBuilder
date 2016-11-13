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
               string language = "";
               EntityRecommendation rec;
               if(result.TryFindEntity("Language", out rec)) {
                    language = rec.Entity;
                    context.UserData.SetValue<string>("language", language);
                    context.UserData.SetValue<bool>("LFM", true);
                    string userlanguage = context.UserData.Get<string>("language");
                    await context.PostAsync($"Looking for members that know {language}.");
                    context.Wait(MessageReceived);


                    context.ConversationData.Get<Stack<int>>("stack");

               }
               else {
                    await context.PostAsync("Looking for members");
                   
                    context.Wait(MessageReceived);
               }
          }
          [LuisIntent("LFG")]
          public async Task LFG(IDialogContext context, LuisResult result) {
               EntityRecommendation rec;
               if (result.TryFindEntity("Language", out rec)) {
                    string language = "";
                    language = rec.Entity;
                    context.UserData.SetValue<string>("language", language);
                    context.UserData.SetValue<bool>("LFG", true);
                    string userlanguage = context.UserData.Get<string>("language");
                    await context.PostAsync($"Looking for team. I know {language}.");
                    context.Wait(MessageReceived);
               }
               else {
                    await context.PostAsync("Looking for team");
                    context.Wait(MessageReceived);
               }

          }
          [LuisIntent("")]
          public async Task None(IDialogContext context, LuisResult result) {
               await context.PostAsync("Unrecognizable command.");
               context.Wait(MessageReceived);
          }
     }
}