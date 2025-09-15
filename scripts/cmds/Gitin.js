const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
 config: {
 name: "gitin",
 aliases: [],
 version: "1.1",
 author: "Chitron Bhattacharjee",
 countDown: 20,
 role: 2,
 shortDescription: { en: "Install all GitHub commands" },
 longDescription: {
 en: "Install & load all .js commands from root of 'lume' GitHub repo into your bot."
 },
 category: "owner",
 guide: {
 en: "Say 'gitin' (no prefix) to install all .js files from lume repo."
 }
 },

 langs: {
 en: {
 unauthorized: "🚫 Only bot owner can use this command.",
 start: "📥 Fetching .js files from lume GitHub repo...",
 done: "✅ Installed %1 command(s)!\n\n%2",
 failed: "❌ Failed to install %1 command(s).\n\n%2",
 error: "⚠️ GitHub Error: %1"
 }
 },

 onStart: async () => {}, // For GoatBot compatibility

 onChat: async function ({ event, message, getLang }) {
 const trigger = event.body?.toLowerCase().trim();
 const ownerUID = "61573375301770";
 const githubToken = "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";
 const repoOwner = "brandchitron";
 const repoName = "lume";
 const folderPath = ""; // root of repo

 if (trigger !== "gitin") return;
 if (event.senderID !== ownerUID) return message.reply(getLang("unauthorized"));

 message.reply(getLang("start"));

 const headers = {
 Authorization: `token ${githubToken}`,
 Accept: "application/vnd.github.v3+json",
 "User-Agent": "GoatBot-GitSync"
 };

 try {
 const res = await axios.get(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderPath}`, {
 headers
 });

 const files = res.data.filter(f => f.name.endsWith(".js"));
 let successList = [];
 let failedList = [];

 for (const file of files) {
 try {
 const rawURL = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${file.name}`;
 const cmdPath = path.join(__dirname, file.name);
 const fileRes = await axios.get(rawURL);
 await fs.outputFile(cmdPath, fileRes.data);

 delete require.cache[require.resolve(cmdPath)];
 const newCmd = require(cmdPath);

 if (newCmd?.config?.name) {
 global.GoatBot.commands.set(newCmd.config.name, newCmd);
 if (newCmd.config.aliases?.length) {
 for (const alias of newCmd.config.aliases) {
 global.GoatBot.aliases.set(alias, newCmd.config.name);
 }
 }
 successList.push(file.name);
 } else {
 failedList.push(file.name);
 }
 } catch (e) {
 console.error(`[FAIL] ${file.name}:`, e.message);
 failedList.push(file.name);
 }
 }

 // Compose result message
 let output = "";
 if (successList.length > 0) {
 output += `✅ Installed (${successList.length}):\n• ` + successList.join("\n• ");
 }
 if (failedList.length > 0) {
 if (output.length > 0) output += "\n\n";
 output += `❌ Failed (${failedList.length}):\n• ` + failedList.join("\n• ");
 }

 return message.reply(output);
 } catch (err) {
 console.error("GitHub API Error:", err.message || err);
 return message.reply(getLang("error", err.response?.data?.message || err.message));
 }
 }
};
