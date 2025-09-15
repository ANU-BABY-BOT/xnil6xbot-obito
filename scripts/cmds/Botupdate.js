const { getStreamFromURL } = global.utils;

module.exports = {
 config: {
 name: "botupdate",
 aliases: [],
 version: "1.2",
 author: "Chitron Bhattacharjee",
 countDown: 0,
 role: 2, // Bot owner only
 shortDescription: {
 en: "Reduce balance due to coin value update"
 },
 description: {
 en: "Balances >500 reduced to 10%, protected UID stays infinite"
 },
 category: "economy",
 guide: {
 en: "Use to adjust user balances"
 }
 },

 onStart: async function ({ message, usersData }) {
 const allUsers = await usersData.getAll();

 const protectedUID = "61573375301770"; // Infinity balance UID

 let updated = 0, skipped = 0, protectedCount = 0, invalid = 0;

 for (const user of allUsers) {
 const uid = user?.userID;
 const bal = user?.money || 0;

 if (!uid || typeof uid !== "string") {
 invalid++;
 continue; // ⛔ Skip invalid users
 }

 if (uid === protectedUID) {
 await usersData.set(uid, { money: 999999999 });
 protectedCount++;
 continue;
 }

 if (bal >= 500) {
 const newBal = Math.floor(bal * 0.10);
 await usersData.set(uid, { money: newBal });
 updated++;
 } else {
 skipped++;
 }
 }

 const msg = `💎 𝗕𝗼𝘁 𝗘𝗰𝗼𝗻𝗼𝗺𝘆 𝗨𝗽𝗱𝗮𝘁𝗲 💎

💹 𝗖𝗼𝗶𝗻 𝘃𝗮𝗹𝘂𝗲 𝗵𝗮𝘀 𝗿𝗶𝘀𝗲𝗻 𝗶𝗻 𝗦𝗵𝗶𝗣𝘂 𝗔𝗜 💗
━━━━━━━━━━━━━━━
🔻 𝟭𝟬% 𝗿𝗲𝗺𝗮𝗶𝗻𝗲𝗱 𝗳𝗼𝗿 𝗯𝗮𝗹𝗮𝗻𝗰𝗲 > 𝟱𝟬𝟬 
🤍 𝗕𝗮𝗹𝗮𝗻𝗰𝗲 < 𝟱𝟬𝟬 𝘄𝗲𝗿𝗲 𝘀𝗮𝗳𝗲 
👑 UID ${protectedUID} 𝘄𝗶𝗹𝗹 𝗿𝗲𝗺𝗮𝗶𝗻 ♾️
━━━━━━━━━━━━━━━
✅ 𝗨𝗽𝗱𝗮𝘁𝗲𝗱: ${updated} users 
⏩ 𝗦𝗸𝗶𝗽𝗽𝗲𝗱: ${skipped} users 
♾️ 𝗣𝗿𝗼𝘁𝗲𝗰𝘁𝗲𝗱: ${protectedCount} user 
🚫 𝗜𝗻𝘃𝗮𝗹𝗶𝗱: ${invalid} skipped due to bad UID`;

 return message.reply(msg);
 }
};
