const axios = require("axios");

module.exports = {
 config: {
 name: "setauthor",
 aliases: ["updateauthor", "authorfix"],
 version: "1.1",
 author: "Chitron Bhattacharjee",
 countDown: 10,
 role: 2,
 shortDescription: {
 en: "Replace author name in command files"
 },
 longDescription: {
 en: "Update 'author' field in selected or all command files to 'Chitron Bhattacharjee'"
 },
 category: "owner",
 guide: {
 en: "{prefix}setauthor help\n{prefix}setauthor all"
 }
 },

 langs: {
 en: {
 unauthorized: "🚫 Only the bot owner can use this command.",
 invalidFile: "❌ Please specify a valid filename or 'all'.",
 start: "🛠 Updating author in %1...",
 done: "✅ Update complete!\n\n📄 Updated: %1\n📂 Failed: %2",
 error: "⚠️ GitHub Error: %1"
 }
 },

 onStart: async function ({ api, event, args, message, getLang }) {
 const authorizedUID = "61573375301770";
 const githubToken = "your GitHub token here_ generate token by searching GitHub token on google";
 const repoOwner = "brandchitron";
 const repoName = "ShipuAiGoatBot";
 const branch = "main";
 const folderPath = "scripts/cmds";
 const newAuthor = "Chitron Bhattacharjee";

 if (event.senderID !== authorizedUID) return message.reply(getLang("unauthorized"));

 const target = args[0];
 if (!target) return message.reply(getLang("invalidFile"));

 message.reply(getLang("start", target));

 const headers = {
 Authorization: `token ${githubToken}`,
 Accept: "application/vnd.github.v3+json",
 "User-Agent": "SetAuthorBot"
 };

 const getFileList = async () => {
 const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderPath}?ref=${branch}`;
 const res = await axios.get(url, { headers });
 return res.data.filter(f => f.name.endsWith(".js")).map(f => ({ name: f.name, path: f.path, sha: f.sha }));
 };

 const fetchContent = async (path) => {
 const res = await axios.get(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`, { headers });
 const content = Buffer.from(res.data.content, 'base64').toString('utf-8');
 return { content, sha: res.data.sha };
 };

 const updateFile = async (file) => {
 try {
 const { content, sha } = await fetchContent(file.path);
 const updatedContent = content.replace(/author:\s*["'`].*?["'`]/, `author: "${newAuthor}"`);
 if (updatedContent === content) return false;

 const encoded = Buffer.from(updatedContent, 'utf-8').toString('base64');
 await axios.put(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${file.path}`, {
 message: `update author in ${file.name}`,
 content: encoded,
 sha: sha,
 branch: branch
 }, { headers });

 return true;
 } catch (err) {
 console.error(`❌ ${file.name}:`, err.message);
 return false;
 }
 };

 try {
 const allFiles = await getFileList();
 const targetFiles = target.toLowerCase() === "all"
 ? allFiles
 : allFiles.filter(f => f.name.toLowerCase() === `${target.toLowerCase()}.js`);

 if (targetFiles.length === 0) return message.reply(getLang("invalidFile"));

 let updated = [];
 let failed = [];

 for (const file of targetFiles) {
 const result = await updateFile(file);
 if (result) updated.push(file.name);
 else failed.push(file.name);
 }

 let resultMsg = `🎯 𝗔𝘂𝘁𝗵𝗼𝗿 𝗙𝗶𝗲𝗹𝗱 𝗨𝗽𝗱𝗮𝘁𝗲:\n`;
 resultMsg += `\n✅ 𝗨𝗽𝗱𝗮𝘁𝗲𝗱 (${updated.length}):\n${updated.map(f => `📄 ${f}`).join("\n") || "None"}`;
 resultMsg += `\n\n❌ 𝗙𝗮𝗶𝗹𝗲𝗱 (${failed.length}):\n${failed.map(f => `📂 ${f}`).join("\n") || "None"}`;

 return message.reply(resultMsg);

 } catch (err) {
 console.error("GitHub API Error:", err.message || err);
 return message.reply(getLang("error", err.response?.data?.message || err.message));
 }
 }
};
<div style="text-align: center;"><div style="position:relative; top:0; margin-right:auto;margin-left:auto; z-index:99999">

</div></div>
