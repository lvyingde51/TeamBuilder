using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Builder.Luis;
using System.Threading.Tasks;
using Microsoft.Bot.Builder.Luis.Models;

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
                    await context.PostAsync($"LFM - Language: { language}");
               }
               else {
                    await context.PostAsync("LFM");
               }
               context.Wait(MessageReceived);

          }
          [LuisIntent("LFG")]
          public async Task LFG(IDialogContext context, LuisResult result) {
               await context.PostAsync("LFG");
               context.Wait(MessageReceived);

          }
          [LuisIntent("")]
          public async Task None(IDialogContext context, LuisResult result) {
               await context.PostAsync("Unrecognizable command.");
               context.Wait(MessageReceived);
          }
     }
}