// gcall.js
module.exports = {
 config: {
 name: "gcall",
 version: "1.3",
 author: "Chitron Bhattacharjee",
 countDown: 5,
 role: 2,
 shortDescription: { en: "Show group list from DB (30 per page)" },
 description: { en: "Show all group names from MongoDB with pagination, remove duplicates" },
 category: "system",
 guide: { en: "{pn} [page]" }
 },

 onStart: async function ({ args, message, threadModel, api }) {
 try {
 let page = parseInt(args[0]) || 1;
 if (page < 1) page = 1;

 const limit = 30;
 const skip = (page - 1) * limit;

 // Get all distinct threadIDs
 const threadIDs = await threadModel.distinct("threadID", {});
 const totalThreads = threadIDs.length;

 if (totalThreads === 0) {
 return message.reply("❌ | No groups found in database.");
 }

 // Slice for pagination
 const pageThreadIDs = threadIDs.slice(skip, skip + limit);

 let threads = [];
 for (const tid of pageThreadIDs) {
 const doc = await threadModel.findOne({ threadID: tid }).lean();
 let name = doc?.name?.trim() || "";

 if (!name) {
 try {
 const info = await api.getThreadInfo(tid);
 name = info.threadName?.trim() || `🆔 ${tid}`;
 await threadModel.updateOne({ threadID: tid }, { name });
 } catch {
 name = `🆔 ${tid}`;
 }
 }
 threads.push({ threadID: tid, name });
 }

 let text = `📜 𝓖𝓻𝓸𝓾𝓹 𝓛𝓲𝓼𝓽 (Page ${page}/${Math.ceil(totalThreads / limit)})\n`;
 text += `━━━━━━━━━━━━━━\n`;
 threads.forEach((thread, index) => {
 text += `${skip + index + 1}. ${thread.name}\n`;
 });
 text += `━━━━━━━━━━━━━━\n📦 Total: ${totalThreads} groups\n`;
 if (skip + limit < totalThreads) {
 text += `➡️ Use: +gcall ${page + 1} for next page`;
 }

 message.reply(text);
 } catch (err) {
 console.error(err);
 message.reply("❌ | Failed to fetch group list.");
 }
 }
};
