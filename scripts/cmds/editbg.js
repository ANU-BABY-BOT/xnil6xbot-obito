const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");

module.exports = {
 config: {
 name: "editbg",
 version: "1.0",
 author: "Chitron Bhattacharjee",
 countDown: 15,
 role: 0,
 shortDescription: {
 en: "Edit background of image using prompt"
 },
 longDescription: {
 en: "Use AI to replace background of replied image using ClipDrop API"
 },
 category: "image",
 guide: {
 en: "Reply to an image and use: +editbg <prompt>\nExample: +editbg in a futuristic city"
 }
 },

 onStart: async function ({ api, event, args, message }) {
 const apiKey = "4dfc395f890c05c6331a4ae7e8ad5559569dd2928e89a44fcee2b6e251d2531087027179aa96fc0f43a554d76eedd9ee";

 // Step 1: Check for image reply
 if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
 return message.reply("📌 Please reply to an image.");
 }

 const attachment = event.messageReply.attachments[0];
 if (attachment.type !== "photo") {
 return message.reply("⚠️ Only photo attachments are supported.");
 }

 const prompt = args.join(" ");
 if (!prompt) return message.reply("💬 Please enter a prompt for the background replacement.");

 const imgUrl = attachment.url;
 const tempInputPath = path.join(__dirname, "cache", `input_${Date.now()}.jpg`);
 const tempOutputPath = path.join(__dirname, "cache", `output_${Date.now()}.jpg`);

 message.reply("🛠️ Processing image using AI...");

 try {
 // Step 2: Download the image
 const imgRes = await axios.get(imgUrl, { responseType: "arraybuffer" });
 fs.writeFileSync(tempInputPath, Buffer.from(imgRes.data, "binary"));

 // Step 3: Prepare form data
 const form = new FormData();
 form.append("image_file", fs.createReadStream(tempInputPath));
 form.append("prompt", prompt);

 // Step 4: Call ClipDrop Replace Background API
 const res = await axios.post("https://clipdrop-api.co/replace-background/v1", form, {
 headers: {
 ...form.getHeaders(),
 "x-api-key": apiKey
 },
 responseType: "arraybuffer"
 });

 fs.writeFileSync(tempOutputPath, Buffer.from(res.data, "binary"));

 // Step 5: Send back the edited image
 const remainingCredits = res.headers["x-remaining-credits"] || "unknown";

 message.reply({
 body: `✅ Background replaced!\n🎯 Prompt: ${prompt}\n🪙 Remaining credits: ${remainingCredits}`,
 attachment: fs.createReadStream(tempOutputPath)
 });

 } catch (err) {
 console.error("❌ API Error:", err.response?.data || err.message);
 message.reply("❌ Failed to process the image.\n📛 Error may be: invalid prompt, file, or quota.");
 }
 }
};
