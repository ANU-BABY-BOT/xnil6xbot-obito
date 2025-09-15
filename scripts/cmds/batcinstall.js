const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

const { loadScripts } = global.utils;
const { configCommands } = global.GoatBot;
const { log } = global.utils;

function generateRandomName() {
 const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
 let name = "";
 for (let i = 0; i < 10; i++) name += chars.charAt(Math.floor(Math.random() * chars.length));
 return name + ".js";
}

module.exports = {
 config: {
 name: "bins",
 aliases: ["batchinstall", "multiinstall"],
 version: "1.0",
 author: "Chitron Bhattacharjee",
 countDown: 5,
 role: 2,
 shortDescription: { en: "Install multiple cmds from links" },
 description: { en: "Batch install multiple command files from pastebin or raw URLs" },
 category: "developer",
 guide: {
 en: "+bins link1,link2,...\n\nExample:\n+bins https://pastebin.com/raw/ZzKqCctE,https://pastebin.com/raw/WyF0rX5G"
 }
 },

 onStart: async function ({ args, message, api, threadsData, usersData, dashBoardData, globalData, threadModel, userModel, dashBoardModel, globalModel, getLang }) {
 if (!args[0]) return message.reply("❌ | Please provide comma-separated links.\nExample:\n+bins https://pastebin.com/raw/xxx,https://pastebin.com/raw/yyy");

 const links = args.join(" ").split(",").map(x => x.trim()).filter(Boolean);
 if (!links.length) return message.reply("❌ | No valid links found.");

 let success = 0, fail = 0, logMsg = "";

 for (const link of links) {
 try {
 const res = await axios.get(link);
 const rawCode = res.data;
 const filename = generateRandomName();
 const filePath = path.join(__dirname, filename);
 await fs.writeFile(filePath, rawCode);

 const infoLoad = loadScripts(
 "cmds",
 filename.replace(".js", ""),
 log,
 configCommands,
 api,
 threadModel,
 userModel,
 dashBoardModel,
 globalModel,
 threadsData,
 usersData,
 dashBoardData,
 globalData,
 getLang,
 rawCode
 );

 if (infoLoad.status === "success") {
 logMsg += `✅ Installed: ${filename}\n`;
 success++;
 } else {
 logMsg += `❌ Load Error: ${filename}\n`;
 fail++;
 }
 } catch (err) {
 logMsg += `❌ Failed: ${link}\n`;
 fail++;
 }
 }

 message.reply(
 `🎯 𝘽𝙖𝙩𝙘𝙝 𝙄𝙣𝙨𝙩𝙖𝙡𝙡 𝙍𝙚𝙨𝙪𝙡𝙩:\n\n` +
 `🟢 Success: ${success}\n🔴 Failed: ${fail}\n\n` +
 logMsg
 );
 }
};
