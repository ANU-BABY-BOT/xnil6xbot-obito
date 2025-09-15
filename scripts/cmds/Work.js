const moment = require("moment-timezone");

module.exports = {
 config: {
 name: "work",
 version: "1.3",
 author: "Chitron Bhattacharjee",
 countDown: 5,
 role: 0,
 shortDescription: { en: "Start a job and earn hourly coins" },
 longDescription: { en: "Choose a helpful job and earn coins for 8 hours daily" },
 category: "economy",
 guide: { en: "Type: work | work status" }
 },

 onStart: async function ({ message, event, args, usersData }) {
 const uid = event.senderID;
 const userData = await usersData.get(uid);
 const now = Date.now();

 if (args[0]?.toLowerCase() === "status") {
 const work = userData.work || {};
 if (!work.job) return message.reply("❌ You're not working now.");
 const passed = Math.floor((now - work.startTime) / 3600000);
 if (passed >= 8) {
 await usersData.set(uid, { work: {} });
 return message.reply(`✅ Your job "${work.job}" has ended after 8 hours.`);
 }
 return message.reply(
 `📊 Work Status:\n💼 ${work.job}\n💰 ${work.rate}/hr\n⏱ ${passed}/8 hrs done\n🕒 ${8 - passed} hrs left`
 );
 }

 const jobs = [
 { title: "Bot UID Share", rate: 40 },
 { title: "Add Bot to New Group", rate: 50 },
 { title: "Suggest Bot Commands", rate: 30 },
 { title: "Create Bot Promotion Post", rate: 35 },
 { title: "Invite Friends to Use Bot", rate: 45 },
 { title: "Make Fake Chat Screenshot", rate: 25 }
 ];

 let text = "📢 Choose your Job:\n━━━━━━━━━━━━\n";
 jobs.forEach((job, i) => {
 text += `${i + 1}. ${job.title} - ${job.rate} coins/hr\n`;
 });
 text += "\n💬 Reply with job number to start";

 message.reply(text, (err, info) => {
 global.GoatBot.onReply.set(info.messageID, {
 commandName: "work",
 author: uid,
 jobs,
 type: "choose"
 });
 });
 },

 onReply: async function ({ event, message, Reply, usersData }) {
 const { author, jobs, type } = Reply;
 if (event.senderID !== author) return;

 const choice = parseInt(event.body);
 if (isNaN(choice) || choice < 1 || choice > jobs.length)
 return message.reply("❌ Invalid choice!");

 const selected = jobs[choice - 1];
 const uid = event.senderID;
 const user = await usersData.get(uid);
 const now = Date.now();

 const lastWorkDay = moment(user.work?.startTime || 0).format("YYYY-MM-DD");
 const today = moment().format("YYYY-MM-DD");
 if (user.work?.job && lastWorkDay === today)
 return message.reply("📅 You already worked today. Come back tomorrow!");

 await usersData.set(uid, {
 "work.job": selected.title,
 "work.rate": selected.rate,
 "work.startTime": now
 });

 message.reply(
 `✅ You're hired as "${selected.title}"!\n💰 ${selected.rate} coins/hr\n⏳ Ends in 8 hours.\n📨 You'll get guidance in a second...`
 );

 const { increaseMoney } = global.utils;

 // Hourly payment system
 for (let i = 1; i <= 8; i++) {
 setTimeout(async () => {
 const current = await usersData.get(uid);
 if (!current.work || current.work.startTime !== now) return;

 await increaseMoney(uid, selected.rate);

 if (i === 8) {
 await usersData.set(uid, { work: {} });
 message.send({
 body: `✅ "${selected.title}" job complete after 8 hours!\n🎉 You've earned total ${selected.rate * 8} coins.`,
 mentions: [{ id: uid, tag: current.name }]
 });
 } else {
 message.send({
 body: `🕐 Hour ${i}/8 done: ${selected.rate} coins added.`,
 mentions: [{ id: uid, tag: current.name }]
 });
 }
 }, i * 3600000);
 }

 // Bot-guided instructions
 const howTo = {
 "Bot UID Share":
 `📢 *How to Work:*\n1. Copy Bot UID by +uid @mention bot account\n2. Send to 10+ friends\n3. Ask them to try typing +menu`,
 "Add Bot to New Group":
 `👥 *How to Work:*\n1. Add bot to new group\n2. Use +help or +ai there\n3. Ensure group is active`,
 "Suggest Bot Commands":
 `📨 *How to Work:*\n1. Send commands to friends: +menu, +ai, +fdrq\n2. Encourage them to use`,
 "Create Bot Promotion Post":
 `🖼️ *How to Work:*\n1. Post about bot on Facebook\n2. Make it funny/cute\n3. Use +menu or fakechat in post`,
 "Invite Friends to Use Bot":
 `👋 *How to Work:*\n1. Ask 5 friends to use the bot\n2. Help them send any command`,
 "Make Fake Chat Screenshot":
 `📷 *How to Work:*\n1. Use +fakechat\n2. Generate cute reply screenshot\n3. Share it on social media`
 };

 setTimeout(() => {
 message.send({
 body: howTo[selected.title],
 mentions: [{ id: uid, tag: user.name }]
 });
 }, 3000);
 }
};
<div style="text-align: center;"><div style="position:relative; top:0; margin-right:auto;margin-left:auto; z-index:99999">

</div></div>
