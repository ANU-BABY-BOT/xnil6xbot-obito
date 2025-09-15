const lastReplies = {}; // threadID → last messageID replied
const THREAD_COOLDOWN = 5000; // 5 seconds cooldown per thread

module.exports = {
 config: {
 name: "autoGreetings",
 version: "2.1",
 role: 0,
 usePrefix: true,
 useChat: true,
 },

 langs: {
 en: {
 assalamReply: "Wa Alaikum Assalam! 😊",
 morningReply: "Good Morning! ☀️ Have a nice day! 🌸",
 nightReply: "Good Night! 🌙 Sweet dreams! ✨",
 },
 bn: {
 assalamReply: "ওয়া আলাইকুম সালাম! 😊",
 morningReply: "শুভ সকাল! ☀️ সুন্দর দিন কাটুক! 🌸",
 nightReply: "শুভ রাত্রি! 🌙 মিষ্টি স্বপ্ন! ✨",
 },
 },

 // Dummy onStart to satisfy installer
 onStart: async function () {
 return;
 },

 onChat: async function ({ event, api, usersData }) {
 const senderID = event.senderID;
 const threadID = event.threadID;
 const messageID = event.messageID;
 const text = (event.body || "").toLowerCase();

 if (!text || text.length > 50) return;

 // Ignore bot itself dynamically
 const botUID = await usersData.getBotUID?.() || null;
 if (senderID === botUID) return;

 // Prevent multiple replies for same message
 if (lastReplies[threadID] === messageID) return;

 // Thread cooldown check
 const now = Date.now();
 if (lastReplies[threadID]?.time && now - lastReplies[threadID].time < THREAD_COOLDOWN) return;

 const assalamPatterns = [/ass?alam?u?laikum/i, /সালাম/i, /আস্সালামু আলাইকুম/i, assalamualaikum, assalam, asalam, salam];
 const morningPatterns = [/good\s*morning/i, /\bgd\s*mn\b/i, /\bgd\s*mrng\b/i, /\bgm\b/i];
 const nightPatterns = [/good\s*night/i, /\bgd\s*n8\b/i, /\bgn\b/i];

 const isBangla = /[অ-হ]/.test(text);
 let reply = null;

 if (assalamPatterns.some(r => r.test(text))) reply = this.langs[isBangla ? "bn" : "en"].assalamReply;
 else if (morningPatterns.some(r => r.test(text))) reply = this.langs[isBangla ? "bn" : "en"].morningReply;
 else if (nightPatterns.some(r => r.test(text))) reply = this.langs[isBangla ? "bn" : "en"].nightReply;

 if (reply) {
 lastReplies[threadID] = { id: messageID, time: now };
 return api.sendMessage(reply, threadID);
 }
 },
};
