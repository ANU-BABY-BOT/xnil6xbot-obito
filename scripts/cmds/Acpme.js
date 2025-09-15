module.exports = {
 config: {
 name: "acpme",
 version: "1.0",
 author: "Chitron Bhattacharjee",
 countDown: 5,
 role: 0,
 shortDescription: {
 en: "Accept your own friend request"
 },
 longDescription: {
 en: "Accept the friend request you sent to the bot"
 },
 category: "Utility",
 guide: {
 en: "Just type +acpme, and the bot will accept your friend request if you sent one."
 }
 },

 onStart: async function ({ api, event, message }) {
 const userID = event.senderID;
 const botID = api.getCurrentUserID();

 const form = {
 av: botID,
 fb_api_req_friendly_name: "FriendingCometFriendRequestConfirmMutation",
 fb_api_caller_class: "RelayModern",
 doc_id: "3147613905362928",
 variables: JSON.stringify({
 input: {
 source: "friends_tab",
 actor_id: botID,
 friend_requester_id: userID,
 client_mutation_id: Math.round(Math.random() * 19).toString()
 },
 scale: 3,
 refresh_num: 0
 })
 };

 try {
 const res = await api.httpPost("https://www.facebook.com/api/graphql/", form);
 const json = JSON.parse(res);

 if (json.errors) {
 return message.reply("❌ You haven't sent a friend request to the bot.");
 }

 return message.reply("✅ Friend request accepted successfully!");
 } catch (e) {
 return message.reply("⚠️ Failed to accept your friend request. Try again later.");
 }
 }
};
