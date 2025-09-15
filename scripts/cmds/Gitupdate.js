const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
 config: {
 name: "gitload",
 aliases: ["cmdsync", "installall", "fetchcmds"],
 version: "1.1",
 author: "Chitron Bhattacharjee",
 countDown: 20,
 role: 2,
 shortDescription: { en: "Load & install all commands from GitHub repo" },
 longDescription: {
 en: "Fetches, installs, and loads all commands (.js) from a GitHub folder into the bot runtime."
 },
 category: "owner",
 guide: {
 en: "{prefix}gitload — fetch all .js files from GitHub and auto install"
 }
 },

 langs: {
 en: {
 unauthorized: "🚫 Only bot owner can use this command.",
 start: "📥 Fetching command files from GitHub...",
 done: "✅ Installation complete!\n\n📦 Installed: %1 files\n❌ Failed: %2 files",
 fileSuccess: "✅ %1",
 fileFailed: "❌ %1",
 error: "⚠️ GitHub Error: %1"
 }
 },

 onStart: async function ({ api, event, message, getLang }) {
 const ownerUID = "61573375301770";
 const githubToken = "generate_token_from_github_settings_search_google_github_token";
 const repoOwner = "brandchitron";
 const repoName = "ShipuAiGoatBot";
 const folderPath = "scripts/cmds";

 if (event.senderID !== ownerUID) return message.reply(getLang("unauthorized"));
 message.reply(getLang("start"));

 const headers = {
 Authorization: `token ${githubToken}`,
 Accept: "application/vnd.github.v3+json",
 "User-Agent": "GoatBot-GitSync"
 };

 try {
 const res = await axios.get(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderPath}`, { headers });
 const files = res.data.filter(f => f.name.endsWith(".js"));

 let successList = [];
 let failedList = [];

 for (const file of files) {
 try {
 const rawURL = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${folderPath}/${file.name}`;
 const cmdPath = path.join(__dirname, file.name);
 const fileRes = await axios.get(rawURL);
 await fs.outputFile(cmdPath, fileRes.data);

 // Dynamically load
 delete require.cache[require.resolve(cmdPath)];
 const newCmd = require(cmdPath);

 if (newCmd?.config?.name) {
 global.GoatBot.commands.set(newCmd.config.name, newCmd);
 if (Array.isArray(newCmd.config.aliases)) {
 for (const alias of newCmd.config.aliases) {
 global.GoatBot.aliases.set(alias, newCmd.config.name);
 }
 }
 successList.push(file.name);
 } else {
 failedList.push(file.name);
 }
 } catch (e) {
 console.error(`❌ ${file.name}:`, e.message);
 failedList.push(file.name);
 }
 }

 let result = `🎯 𝗚𝗶𝘁𝗛𝘂𝗯 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗦𝘆𝗻𝗰 𝗦𝘂𝗺𝗺𝗮𝗿𝘆:\n`;
 result += `\n✅ 𝗜𝗻𝘀𝘁𝗮𝗹𝗹𝗲𝗱 (${successList.length}):\n${successList.map(f => `📄 ${f}`).join("\n") || "None"}`;
 result += `\n\n❌ 𝗙𝗮𝗶𝗹𝗲𝗱 (${failedList.length}):\n${failedList.map(f => `📂 ${f}`).join("\n") || "None"}`;

 return message.reply(result);
 } catch (err) {
 console.error("GitHub API Error:", err.message || err);
 return message.reply(getLang("error", err.response?.data?.message || err.message));
 }
 }
};
