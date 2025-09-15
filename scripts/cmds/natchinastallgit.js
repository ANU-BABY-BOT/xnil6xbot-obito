const axios = require("axios");

module.exports = {
 config: {
 name: "batin",
 version: "1.0",
 author: "Chitron Bhattacharjee",
 countDown: 5,
 role: 2,
 shortDescription: {
 en: "Batch upload command files to GitHub"
 },
 longDescription: {
 en: "Fetches .js files from a public folder URL and uploads them to GitHub if they don't exist"
 },
 category: "owner",
 guide: {
 en: "+batin https://example.com/folder/"
 }
 },

 onStart: async function ({ args, message }) {
 const folderUrl = args[0];
 if (!folderUrl || !folderUrl.startsWith("http")) {
 return message.reply("❌ Please provide a valid folder URL.");
 }

 const repo = "brandchitron/ShipuAiGoatBot";
 const branch = "main";
 const uploadPath = "scripts/cmds/";
 const githubToken = "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // 🔐 Replace with yours

 try {
 const res = await axios.get(folderUrl);
 const fileRegex = /href="([^"]+\.js)"/g;
 const files = [];
 let match;

 while ((match = fileRegex.exec(res.data)) !== null) {
 files.push(match[1]);
 }

 if (files.length === 0) return message.reply("❌ No JS files found in folder.");

 const githubFiles = await axios.get(
 `https://api.github.com/repos/${repo}/contents/${uploadPath}?ref=${branch}`,
 {
 headers: {
 Authorization: `token ${githubToken}`,
 Accept: "application/vnd.github.v3+json"
 }
 }
 );

 const existing = githubFiles.data.map(f => f.name);
 let uploaded = 0, skipped = 0;

 for (const filename of files) {
 if (existing.includes(filename)) {
 skipped++;
 continue;
 }

 const fileUrl = folderUrl + filename;
 const fileData = await axios.get(fileUrl);
 const content = Buffer.from(fileData.data).toString("base64");

 await axios.put(
 `https://api.github.com/repos/${repo}/contents/${uploadPath}${filename}`,
 {
 message: `batin: upload ${filename}`,
 content: content,
 branch: branch
 },
 {
 headers: {
 Authorization: `token ${githubToken}`,
 Accept: "application/vnd.github.v3+json"
 }
 }
 );

 uploaded++;
 }

 return message.reply(
 `📤 Batch upload done!\n✅ Uploaded: ${uploaded}\n⏭️ Skipped (already exists): ${skipped}`
 );
 } catch (err) {
 console.error(err);
 return message.reply("❌ Failed to process. Check folder link or GitHub settings.");
 }
 }
};
