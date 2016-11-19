using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using Microsoft.Bot.Connector;
using Newtonsoft.Json;
using Microsoft.Bot.Builder.Dialogs;
using System.Collections.Generic;

namespace TeamBuilderBot {
     [BotAuthentication]
     public class MessagesController : ApiController {

          /// <summary>
          /// POST: api/Messages
          /// Receive a message from a user and reply to it
          /// </summary>
          public async Task<HttpResponseMessage> Post([FromBody]Activity activity) {
               if (activity.Type == ActivityTypes.Message) {
                    StateClient stateClient = activity.GetStateClient();

                    // Get User ID
                    BotData userData = await stateClient.BotState.GetUserDataAsync(activity.ChannelId, activity.From.Id);
                    userData.SetProperty<string>("userID", activity.From.Id);
                    await stateClient.BotState.SetUserDataAsync(activity.ChannelId, activity.From.Id, userData);

                    // Reset Dictionaries FIXME
                    BotData conversationData = await stateClient.BotState.GetConversationDataAsync(activity.ChannelId, activity.Conversation.Id);
                    if (conversationData.GetProperty<Dictionary<string, string>>("LFMdictionary") == null) {
                         conversationData.SetProperty<Dictionary<string, string>>("LFMdictionary", new Dictionary<string, string>());
                    }
                    if (conversationData.GetProperty<Dictionary<string, string>>("LFGdictionary") == null) {
                         conversationData.SetProperty<Dictionary<string, string>>("LFGdictionary", new Dictionary<string, string>());
                    }
                    await stateClient.BotState.SetConversationDataAsync(activity.ChannelId, activity.Conversation.Id, conversationData);
                    await Conversation.SendAsync(activity, () => new SimpleLUISDialog());
               }
               else {
                    HandleSystemMessage(activity);
               }
               var response = Request.CreateResponse(HttpStatusCode.OK);
               return response;
          }

          private Activity HandleSystemMessage(Activity message) {
               if (message.Type == ActivityTypes.DeleteUserData) {
                    // Implement user deletion here
                    // If we handle user deletion, return a real message
               }
               else if (message.Type == ActivityTypes.ConversationUpdate) {
                    // Handle conversation state changes, like members being added and removed
                    // Use Activity.MembersAdded and Activity.MembersRemoved and Activity.Action for info
                    // Not available in all channels
               }
               else if (message.Type == ActivityTypes.ContactRelationUpdate) {
                    // Handle add/remove from contact lists
                    // Activity.From + Activity.Action represent what happened
               }
               else if (message.Type == ActivityTypes.Typing) {
                    // Handle knowing tha the user is typing
               }
               else if (message.Type == ActivityTypes.Ping) {
               }

               return null;
          }
     }
}