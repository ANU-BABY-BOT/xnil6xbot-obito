const Jimp = require("jimp");
const QrCode = require("qrcode-reader");
const fs = require("fs-extra");
const path = require("path");
const https = require("https");

module.exports = {
 config: {
 name: "qrscan",
 version: "1.1",
 author: "Chitron Bhattacharjee",
 countDown: 1,
 role: 0,
 shortDescription: {
 en: "Auto-scan QR codes in images"
 },
 description: {
 en: "Scans every incoming image for QR codes and replies only if found"
 },
 category: "tools",
 guide: {
 en: "Just send an image with a QR code – the bot replies automatically!"
 }
 },

 // ─────────────────────────────
 // Auto detector (no-prefix)
 // ─────────────────────────────
 onChat: async function ({ event, message }) {
 const { attachments } = event;
 if (!attachments?.length) return;

 const photo = attachments.find(a => a.type === "photo" && a.url);
 if (!photo) return;

 // Cache-aware download
 const cacheDir = path.join(__dirname, "cache");
 await fs.ensureDir(cacheDir);
 const imgPath = path.join(cacheDir, `qrscan_${Date.now()}.jpg`);

 try {
 await downloadImage(photo.url, imgPath);

 const jimpImg = await Jimp.read(imgPath);
 const qr = new QrCode();

 const result = await new Promise(resolve => {
 qr.callback = (err, v) => resolve(err || !v ? null : v.result);
 qr.decode(jimpImg.bitmap);
 });

 await fs.unlink(imgPath);

 if (result)
 return message.reply(`✅ 𝗤𝗥 𝗖𝗼𝗱𝗲 𝗙𝗼𝘂𝗻𝗱:\n${result}`);
 } catch (_) {
 /* silent – ignore non-QR or corrupt images */
 }
 },

 // Dummy installer entry (unchanged)
 onStart: async function () {}
};

// ─────────────────────────────
// Helper – safe image download
// ─────────────────────────────
function downloadImage(url, dest) {
 return new Promise((resolve, reject) => {
 const file = fs.createWriteStream(dest);
 https.get(url, res => {
 res.pipe(file);
 file.on("finish", () => file.close(resolve));
 }).on("error", err => {
 fs.unlink(dest, () => reject(err));
 });
 });
}
