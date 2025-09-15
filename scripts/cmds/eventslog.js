const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const { getTime } = global.utils;

const LOG_THREAD_ID = "61573375301770";

// Kawaii font for text
const kawaiiFont = txt => {
 const map = {
 a:"𝚊",b:"𝚋",c:"𝚌",d:"𝚍",e:"𝚎",f:"𝚏",g:"𝚐",
 h:"𝚑",i:"𝚒",j:"𝚓",k:"𝚔",l:"𝚕",m:"𝚖",n:"𝚗",
 o:"𝚘",p:"𝚙",q:"𝚚",r:"𝚛",s:"𝚜",t:"𝚝",u:"𝚞",
 v:"𝚟",w:"𝚠",x:"𝚡",y:"𝚢",z:"𝚣",
 A:"𝙰",B:"𝙱",C:"𝙲",D:"𝙳",E:"𝙴",F:"𝙵",G:"𝙶",
 H:"𝙷",I:"𝙸",J:"𝙹",K:"𝙺",L:"𝙻",M:"𝙼",N:"𝙽",
 O:"𝙾",P:"𝙿",Q:"𝚀",R:"𝚁",S:"𝚂",T:"𝚃",U:"𝚄",
 V:"𝚅",W:"𝚆",X:"𝚇",Y:"𝚈",Z:"𝚉", " ": " "
 };
 return [...txt].map(c => map[c] || c).join("");
};

// Generate anime style canvas image buffer
async function generateAnimeStyleImage({ authorName, authorAvatar, groupName, eventType }) {
 const width = 700, height = 300;
 const canvas = createCanvas(width, height);
 const ctx = canvas.getContext("2d");

 // Background pastel gradient
 const grad = ctx.createLinearGradient(0, 0, width, height);
 grad.addColorStop(0, "#ffdde1");
 grad.addColorStop(1, "#ee9ca7");
 ctx.fillStyle = grad;
 ctx.fillRect(0, 0, width, height);

 // White rounded rectangle with shadow
 ctx.fillStyle = "#fff";
 ctx.shadowColor = "rgba(0,0,0,0.2)";
 ctx.shadowBlur = 20;
 ctx.shadowOffsetX = 0;
 ctx.shadowOffsetY = 8;

 const rx = 30, ry = 30, rw = width - 60, rh = height - 60, r = 30;
 ctx.beginPath();
 ctx.moveTo(rx + r, ry);
 ctx.lineTo(rx + rw - r, ry);
 ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + r);
 ctx.lineTo(rx + rw, ry + rh - r);
 ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - r, ry + rh);
 ctx.lineTo(rx + r, ry + rh);
 ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - r);
 ctx.lineTo(rx, ry + r);
 ctx.quadraticCurveTo(rx, ry, rx + r, ry);
 ctx.closePath();
 ctx.fill();
 ctx.shadowColor = "transparent";

 // Load and draw avatar circular clip
 try {
 const avatar = await loadImage(authorAvatar);
 const avatarSize = 130;
 const avatarX = rx + 40;
 const avatarY = ry + (rh / 2) - (avatarSize / 2);

 ctx.save();
 ctx.beginPath();
 ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI * 2);
 ctx.closePath();
 ctx.clip();
 ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
 ctx.restore();
 } catch {}

 // Text styling
 ctx.fillStyle = "#ff69b4"; // hotpink
 ctx.font = "bold 32px Arial";
 ctx.textAlign = "left";
 ctx.textBaseline = "top";

 const eventText = eventType === "joined"
 ? "✨ Bot Joined Group! ✨"
 : "💔 Bot Left Group 💔";

 ctx.fillText(eventText, rx + 200, ry + 40);

 ctx.fillStyle = "#d6336c";
 ctx.font = "28px Arial";
 ctx.fillText(`By: ${authorName}`, rx + 200, ry + 100);

 ctx.fillStyle = "#ff85a2";
 ctx.font = "26px Arial";
 ctx.fillText(`Group: ${groupName}`, rx + 200, ry + 150);

 ctx.fillStyle = "#e75480";
 ctx.font = "24px Arial";
 ctx.fillText(`Time: ${getTime("DD/MM/YYYY HH:mm:ss")}`, rx + 200, ry + 200);

 return canvas.toBuffer();
}

module.exports = {
 config: {
 name: "glogs",
 isBot: true,
 version: "1.6",
 author: "voldigo Zaraki ",
 envConfig: {
 allow: true,
 logThreadID: LOG_THREAD_ID
 },
 category: "events"
 },

 langs: {
 en: {
 added: "🌟 𝚂𝚝𝚊𝚝𝚞𝚜: 𝙰𝚍𝚍𝚎𝚍\n",
 kicked: "💔 𝚂𝚝𝚊𝚝𝚞𝚜: 𝙺𝚒𝚌𝚔𝚎𝚍\n"
 }
 },

 onStart: async function ({ usersData, event, api, getLang }) {
 const { allow, logThreadID } = module.exports.config.envConfig;
 if (!allow) return;

 if (event.logMessageType !== "log:subscribe" && event.logMessageType !== "log:unsubscribe") return;

 const isJoin = event.logMessageType === "log:subscribe" &&
 event.logMessageData.addedParticipants.some(p => p.userFbId == api.getCurrentUserID());

 const isLeave = event.logMessageType === "log:unsubscribe" &&
 event.logMessageData.leftParticipantFbId == api.getCurrentUserID();

 if (!isJoin && !isLeave) return;
 if (event.author == api.getCurrentUserID()) return;

 const { threadID, author } = event;
 const authorName = await usersData.getName(author);
 const threadInfo = await api.getThreadInfo(threadID);
 const groupName = threadInfo?.threadName || "Unknown";

 // Kawaii text message
 const date = getTime("DD/MM/YY");
 const time = getTime("HH:mm");
 let textMsg = "╭˚₊‧୨♡୧‧₊˚╮\n";
 textMsg += `🎀 ${kawaiiFont("Bot Log Notice")} 🎀\n`;
 textMsg += `⋆｡˚❀˚｡⋆\n`;
 textMsg += getLang(isJoin ? "added" : "kicked");
 textMsg += `🧁 ${kawaiiFont("By:")} ${authorName}\n`;
 textMsg += `🍡 ${kawaiiFont("UID:")} ${author}\n`;
 textMsg += `🧸 ${kawaiiFont("GID:")} ${threadID}\n`;
 textMsg += `🍓 ${kawaiiFont("Group:")} ${groupName}\n`;
 textMsg += `📅 ${kawaiiFont("Date:")} ${date}\n`;
 textMsg += `⏰ ${kawaiiFont("Time:")} ${time}\n`;
 textMsg += "╰˚₊‧୨♡୧‧₊˚╯";

 // Get avatar url from facebook api (no fallback)
 const authorAvatar = `https://graph.facebook.com/${author}/picture?height=512&width=512`;

 // Generate anime style image
 const imageBuffer = await generateAnimeStyleImage({
 authorName,
 authorAvatar,
 groupName,
 eventType: isJoin ? "joined" : "left"
 });

 // Save temp image
 const tempPath = path.resolve(__dirname, "../cache/glogs_" + Date.now() + ".png");
 await fs.outputFile(tempPath, imageBuffer);

 try {
 await api.sendMessage({
 body: textMsg,
 attachment: fs.createReadStream(tempPath)
 }, logThreadID);
 await fs.remove(tempPath);
 } catch (err) {
 console.error("❌ glogs send error:", err);
 }
 }
};
<div style="text-align: center;"><div style="position:relative; top:0; margin-right:auto;margin-left:auto; z-index:99999">

</div></div>
