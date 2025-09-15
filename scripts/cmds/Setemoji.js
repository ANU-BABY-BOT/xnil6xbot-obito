const { getCurrentThread } = global.utils;

module.experts  = {
 config: {
 name: "setemoji",
 version: "1.0",
 role: 0,
 countDown: 5,
 shortDescription: {
 en: "Change group emoji",
 },
 longDescription: {
 en: "Change the group chat emoji to any emoji you provide.",
 },
 category: "group",
 guide: {
 en: "+setemoji 😎",
 },
 },

 onStart: async function ({ api, event, args, message }) {
 if (!args[0]) {
 return message.reply(
 "🔧 𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗮𝗻 𝗲𝗺𝗼𝗷𝗶.\n\n𝗘𝘅𝗮𝗺𝗽𝗹𝗲: +setemoji 😇"
 );
 }

 const emoji = args[0];
 const threadID = event.threadID;

 try {
 await api.changeEmoji(emoji, threadID);
 message.reply(`✅ 𝗚𝗿𝗼𝘂𝗽 𝗲𝗺𝗼𝗷𝗶 𝗵𝗮𝘀 𝗯𝗲𝗲𝗻 𝘀𝗲𝘁 𝘁𝗼: ${emoji}`);
 } catch (err) {
 message.reply(
 "❌ 𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗰𝗵𝗮𝗻𝗴𝗲 𝗲𝗺𝗼𝗷𝗶.\n𝗠𝗮𝗸𝗲 𝘀𝘂𝗿𝗲 𝗶𝘁'𝘀 𝗮 𝘃𝗮𝗹𝗶𝗱 𝗲𝗺𝗼𝗷𝗶 𝗮𝗻𝗱 𝗜 𝗵𝗮𝘃𝗲 𝗽𝗲𝗿𝗺𝗶𝘀𝘀𝗶𝗼𝗻."
 );
 }
 },
};
