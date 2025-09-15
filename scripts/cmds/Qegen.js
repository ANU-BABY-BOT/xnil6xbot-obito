const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage, registerFont } = require("canvas");
const crypto = require("crypto");

module.exports = {
 config: {
 name: "qrgen",
 version: "2.0",
 author: "Chitron Bhattacharjee",
 countDown: 5,
 role: 0,
 shortDescription: {
 en: "Generate QR with style"
 },
 longDescription: {
 en: "Stylish QR code with border and signature"
 },
 category: "tools",
 guide: {
 en: "{pn} your text or link\n\nExample:\n{pn} https://example.com"
 }
 },

 onStart: async function ({ message, args }) {
 const text = args.join(" ");
 if (!text) return message.reply("❌ Please provide some text or link.");
 return generateStyledQR({ message, content: text });
 },

 onChat: async function ({ message, event }) {
 if (!event.body?.toLowerCase().startsWith("qrgen ")) return;
 const content = event.body.slice(6).trim();
 if (!content) return;
 return generateStyledQR({ message, content });
 }
};

// === MAIN QR GENERATOR ===
async function generateStyledQR({ message, content }) {
 try {
 const hash = crypto.createHash("md5").update(content).digest("hex").slice(0, 10);
 const cachePath = path.join(__dirname, "cache", `qrgen_${hash}.png`);
 await fs.ensureDir(path.join(__dirname, "cache"));

 if (await fs.existsSync(cachePath)) {
 return message.reply({
 body: `🎨 Styled QR for:\n「 ${content} 」`,
 attachment: fs.createReadStream(cachePath)
 });
 }

 // STEP 1: Download plain QR
 const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(content)}`;
 const response = await axios.get(qrUrl, { responseType: "arraybuffer" });
 const qrImage = await loadImage(Buffer.from(response.data));

 // STEP 2: Prepare canvas
 const border = 6;
 const textHeight = 40;
 const canvasSize = qrImage.width + border * 2;
 const canvas = createCanvas(canvasSize, canvasSize + textHeight);
 const ctx = canvas.getContext("2d");

 // White background
 ctx.fillStyle = "#ffffff";
 ctx.fillRect(0, 0, canvas.width, canvas.height);

 // Shadow border
 ctx.fillStyle = "#333";
 ctx.fillRect(0, 0, canvas.width, canvas.height);
 ctx.fillStyle = "#ffffff";
 ctx.fillRect(border, border, qrImage.width, qrImage.height);

 // Draw QR
 ctx.drawImage(qrImage, border, border);

 // Text
 ctx.fillStyle = "#666";
 ctx.font = "bold 20px Sans-serif";
 ctx.textAlign = "center";
 ctx.fillText("created with ShiPu Ai", canvas.width / 2, canvas.height - 10);

 // Save
 const out = fs.createWriteStream(cachePath);
 const stream = canvas.createPNGStream();
 stream.pipe(out);
 await new Promise(resolve => out.on("finish", resolve));

 // Send
 return message.reply({
 body: `🎨 Styled QR for:\n「 ${content} 」`,
 attachment: fs.createReadStream(cachePath)
 });

 } catch (err) {
 console.error("QR Styling Error:", err);
 return message.reply("⚠️ Failed to generate styled QR. Try again.");
 }
}
