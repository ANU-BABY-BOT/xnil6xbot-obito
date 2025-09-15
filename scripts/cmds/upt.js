const os = require("os");
const { execSync } = require("child_process");
const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

function formatBytes(bytes) {
 const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
 if (bytes === 0) return "0 Bytes";
 const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
 return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
}

module.exports = {
 config: {
 name: "uptime",
 version: "2.2",
 author: "Chitron Bhattacharjee ✨🌸",
 shortDescription: "Stylized uptime dashboard",
 longDescription: "Lightweight 360p dashboard with fake complex data visuals",
 category: "system",
 guide: "{pn}"
 },

 onStart: async function ({ message, usersData }) {
 try {
 // Stats
 const uptimeSec = process.uptime();
 const h = Math.floor(uptimeSec / 3600);
 const m = Math.floor((uptimeSec % 3600) / 60);
 const s = Math.floor(uptimeSec % 60);
 const uptime = `${h}h ${m}m ${s}s`;

 const totalMem = os.totalmem();
 const usedMem = totalMem - os.freemem();
 const memUsage = ((usedMem / totalMem) * 100).toFixed(1);

 let diskUsed = 0, diskTotal = 1;
 try {
 const df = execSync("df -k /").toString().split("\n")[1].split(/\s+/);
 diskUsed = parseInt(df[2]) * 1024;
 diskTotal = parseInt(df[1]) * 1024;
 } catch {}

 const diskUsage = ((diskUsed / diskTotal) * 100).toFixed(1);

 // Canvas 360p
 const canvas = createCanvas(640, 360);
 const ctx = canvas.getContext("2d");

 // Background
 ctx.fillStyle = "#0f172a";
 ctx.fillRect(0, 0, 640, 360);

 // Title
 ctx.fillStyle = "#22c55e";
 ctx.font = "18px sans-serif";
 ctx.fillText("BOT UPTIME DASHBOARD", 20, 30);

 ctx.fillStyle = "#fff";
 ctx.font = "14px monospace";
 ctx.fillText(`Uptime: ${uptime}`, 20, 60);
 ctx.fillText(`Users: ${(await usersData.getAll()).length}`, 20, 80);

 // Memory bar
 ctx.fillStyle = "#1e293b";
 ctx.fillRect(20, 140, 200, 15);
 ctx.fillStyle = "#38bdf8";
 ctx.fillRect(20, 140, 2 * memUsage, 15);
 ctx.fillStyle = "#fff";
 ctx.fillText(`RAM: ${memUsage}% (${formatBytes(usedMem)}/${formatBytes(totalMem)})`, 230, 152);

 // Disk bar
 ctx.fillStyle = "#1e293b";
 ctx.fillRect(20, 180, 200, 15);
 ctx.fillStyle = "#facc15";
 ctx.fillRect(20, 180, 2 * diskUsage, 15);
 ctx.fillStyle = "#fff";
 ctx.fillText(`Disk: ${diskUsage}% (${formatBytes(diskUsed)}/${formatBytes(diskTotal)})`, 230, 192);

 // Fake complex graph lines
 ctx.strokeStyle = "#9333ea";
 ctx.beginPath();
 ctx.moveTo(20, 250);
 for (let x = 20; x < 600; x += 20) {
 const y = 250 - Math.sin(x / 20) * (Math.random() * 20 + 10);
 ctx.lineTo(x, y);
 }
 ctx.stroke();

 // Random scatter dots
 ctx.fillStyle = "#facc15";
 for (let i = 0; i < 15; i++) {
 ctx.beginPath();
 ctx.arc(Math.random() * 600 + 20, Math.random() * 80 + 260, 3, 0, Math.PI * 2);
 ctx.fill();
 }

 // Author name bottom right
 ctx.fillStyle = "#22c55e";
 ctx.font = "12px sans-serif";
 ctx.textAlign = "right";
 ctx.fillText("Chitron Bhattacharjee ✨🌸", 620, 350);

 // Save image
 const filePath = path.join(__dirname, "uptime_dashboard.png");
 fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

 message.reply({
 body: "📊 | Stylized Uptime Dashboard",
 attachment: fs.createReadStream(filePath)
 });

 } catch (err) {
 console.error(err);
 message.reply("❌ | Failed to generate stylized uptime dashboard.");
 }
 }
};
