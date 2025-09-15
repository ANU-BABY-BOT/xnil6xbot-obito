const moment = require("moment-timezone");
const Canvas = require("canvas");
const path = require("path");
const fs = require("fs-extra");

module.exports = {
 config: {
 name: "daily",
 version: "2.1",
 author: "Chitron Bhattacharjee",
 countDown: 5,
 role: 0,
 description: { en: "Claim your daily kawaii reward 🎀" },
 category: "🎀 𝗪𝗔𝗟𝗟𝗘𝗧 🎀",
 guide: { en: "{pn} – claim\n{pn} info – reward table" },
 envConfig: { rewardFirstDay: { coin: 100000000000, exp: 100000 } }
 },

 langs: {
 en: {
 days: ["💮 𝒮𝓊𝓃𝒹𝒶𝓎","🌸 𝑀𝑜𝓃𝒹𝒶𝓎","🌷 𝒯𝓊𝑒𝓈𝒹𝒶𝓎",
 "🌼 𝒲𝑒𝒹𝓃𝑒𝓈𝒹𝒶𝓎","🍡 𝒯𝒽𝓊𝓇𝓈𝒹𝒶𝓎",
 "🍰 𝐹𝓇𝒾𝒹𝒶𝓎","🎀 𝒮𝒶𝓉𝓊𝓇𝒹𝒶𝓎"],
 already: "⚠️ You already claimed today's gift!",
 fallback:
`🎀 𝐃𝐀𝐈𝐋𝐘 𝐑𝐄𝐖𝐀𝐑𝐃 🎀

🗓 %1
💰 %2 coins
✨ %3 EXP

💖 Claimed Successfully!`
 }
 },

 /* ───────── {pn} or onChat ───────── */
 onStart,
 onChat
};

/* ------------------------------------- */
/* MAIN HANDLERS */
/* ------------------------------------- */
async function onStart({ args, message, event, envCommands,
 usersData, commandName, getLang }) {

 if (args[0] === "info")
 return message.reply(buildInfo(getLang, envCommands[commandName].rewardFirstDay));

 return claimReward({ event, message, usersData, envCommands, commandName, getLang });
}

async function onChat({ event, message, usersData,
 envCommands, commandName, getLang }) {

 // no-prefix trigger if message *starts with* "daily"
 if (!event.body?.toLowerCase().trim().startsWith("daily")) return;
 return claimReward({ event, message, usersData, envCommands, commandName, getLang });
}

/* ------------------------------------- */
/* CLAIM LOGIC */
/* ------------------------------------- */
async function claimReward({ event, message, usersData,
 envCommands, commandName, getLang }) {

 const rewardCfg = envCommands[commandName].rewardFirstDay;
 const { senderID } = event;
 const userData = await usersData.get(senderID);
 const todayStr = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY");
 if (userData.data.lastTimeGetReward === todayStr)
 return message.reply(getLang("already"));

 const dayIdx = new Date().getDay(); // 0-6
 const multiplier = Math.pow(1.2, dayIdx === 0 ? 6 : dayIdx - 1);
 const coinReward = Math.floor(rewardCfg.coin * multiplier);
 const expReward = Math.floor(rewardCfg.exp * multiplier);

 userData.data.lastTimeGetReward = todayStr;
 await usersData.set(senderID, {
 money: userData.money + coinReward,
 exp : userData.exp + expReward,
 data : userData.data
 });

 // Try to send kawaii image first
 try {
 const attachment = await makeCard(getLang("days")[dayIdx], coinReward, expReward);
 return message.reply({ body: "", attachment });
 } catch (e) {
 // Fallback plain text
 return message.reply(getLang("fallback",
 getLang("days")[dayIdx].replace(/^.+?\s/, ""), // just the word Monday…
 coinReward, expReward));
 }
}

/* ------------------------------------- */
/* INFO TABLE */
/* ------------------------------------- */
function buildInfo(getLang, base) {
 let out = "🎀 𝒲𝑒𝑒𝓀𝓁𝓎 𝑅𝑒𝓌𝒶𝓇𝒹𝓈 🎀\n";
 for (let i = 1; i <= 7; i++) {
 const idx = i === 7 ? 0 : i;
 const coin = Math.floor(base.coin * Math.pow(1.2, i - 1));
 const exp = Math.floor(base.exp * Math.pow(1.2, i - 1));
 out += `\n${getLang("days")[idx]}\n💰 ${coin} ✨ ${exp}`;
 }
 return out;
}

/* ------------------------------------- */
/* CANVAS CARD */
/* ------------------------------------- */
async function makeCard(dayText, coins, exp) {
 const W = 600, H = 350;
 const canvas = Canvas.createCanvas(W, H);
 const ctx = canvas.getContext("2d");

 // background
 ctx.fillStyle = "#fff0f5";
 ctx.fillRect(0, 0, W, H);

 // cute border
 ctx.strokeStyle = "#ff69b4";
 ctx.lineWidth = 12;
 ctx.strokeRect(6, 6, W - 12, H - 12);

 // font
 const fontPath = path.join(__dirname, "assets", "font", "BeVietnamPro-Bold.ttf");
 if (fs.existsSync(fontPath))
 Canvas.registerFont(fontPath, { family: "CuteBold" });

 ctx.fillStyle = "#ff1493";
 ctx.textAlign = "center";

 ctx.font = "bold 36px CuteBold, sans-serif";
 ctx.fillText("🎀 𝐃𝐀𝐈𝐋𝐘 𝐑𝐄𝐖𝐀𝐑𝐃 🎀", W / 2, 70);

 ctx.fillStyle = "#333";
 ctx.font = "bold 30px CuteBold, sans-serif";
 ctx.fillText(`🗓 ${dayText.replace(/^.+?\s/, "")}`, W / 2, 150);

 ctx.font = "bold 28px CuteBold, sans-serif";
 ctx.fillText(`💰 ${coins} coins`, W / 2, 210);
 ctx.fillText(`✨ ${exp} EXP`, W / 2, 260);

 ctx.fillStyle = "#ff1493";
 ctx.font = "bold 26px CuteBold, sans-serif";
 ctx.fillText("💖 Claimed Successfully!", W / 2, 310);

 return canvas.toBuffer("image/png");
}
<div style="text-align: center;"><div style="position:relative; top:0; margin-right:auto;margin-left:auto; z-index:99999">

</div></div>
