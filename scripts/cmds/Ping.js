/**
 * Ping command (360p)
 * Measures message-send latency (round-trip for message.reply) multiple times,
 * computes average/min/max/jitter, and returns a compact 640x360 PNG report.
 *
 * Author: Chitron Bhattacharjee ✨🌸
 *
 * Notes:
 * - The command measures how long `message.reply()` takes to resolve (this approximates API/send latency).
 * - It will try to delete the temporary ping messages (if `api.removeMessage` is available),
 * otherwise they will remain in chat (use with caution).
 * - Default tries: 5 (configurable via `tries` variable).
 */

const os = require("os");
const { createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
 config: {
 name: "ping",
 aliases: ["p", "latency"],
 version: "1.0",
 author: "Chitron Bhattacharjee",
 shortDescription: "Measure bot/API ping (visual)",
 longDescription: "Sends several test messages to measure send latency and returns a small image report.",
 category: "system",
 guide: "{pn} (optional) {tries} - e.g. +ping 3"
 },

 onStart: async function ({ message, args, api }) {
 try {
 // number of tries (default 5), allow user override via +ping 3
 const tries = Math.max(1, Math.min(10, parseInt(args[0]) || 5));

 // small helper to sleep
 const wait = (ms) => new Promise((res) => setTimeout(res, ms));

 const pings = [];
 const removedMsgIds = [];

 // Warmup small pause
 await wait(120);

 for (let i = 0; i < tries; i++) {
 const t0 = Date.now();
 // send a tiny ephemeral message; capture return if any
 let sentInfo = null;
 try {
 // message.reply typically returns after send; we measure that
 sentInfo = await message.reply({ body: `⏱ Ping test ${i + 1}/${tries}...` });
 } catch (err) {
 // If message.reply rejected, record a high value
 console.error("ping: message.reply failed:", err && err.message ? err.message : err);
 pings.push(9999);
 // small wait then continue
 await wait(150);
 continue;
 }
 const t1 = Date.now();
 const delta = t1 - t0;
 pings.push(delta);

 // try to remove the ping message to avoid spam (best-effort)
 try {
 // different frameworks return different shapes; handle common ones
 // attempt 1: if sentInfo.messageID or sentInfo.messageId
 const mid = (sentInfo && (sentInfo.messageID || sentInfo.messageId || sentInfo.id)) || null;
 if (mid && api && typeof api.removeMessage === "function") {
 await api.removeMessage(mid).catch(() => {});
 removedMsgIds.push(mid);
 }
 } catch (e) {
 // ignore delete errors
 }

 // small randomized wait so pings aren't perfectly identical
 await wait(120 + Math.round(Math.random() * 130));
 }

 // compute stats
 const sum = pings.reduce((a, b) => a + b, 0);
 const avg = (sum / pings.length) || 0;
 const min = Math.min(...pings);
 const max = Math.max(...pings);
 // jitter = average absolute deviation
 const jitter = pings.length ? (pings.reduce((a, b) => a + Math.abs(b - avg), 0) / pings.length) : 0;

 // --- Draw a compact 640x360 image report ---
 const width = 640;
 const height = 360;
 const canvas = createCanvas(width, height);
 const ctx = canvas.getContext("2d");

 // colors & style
 const bg = "#0f172a";
 const accent = "#22c55e";
 const barGood = "#38bdf8";
 const barWarn = "#f59e0b";
 const barBad = "#ef4444";
 const neutral = "rgba(255,255,255,0.9)";

 // background
 ctx.fillStyle = bg;
 ctx.fillRect(0, 0, width, height);

 // header
 ctx.fillStyle = accent;
 ctx.font = "18px Sans";
 ctx.fillText("PING REPORT", 20, 32);
 ctx.font = "11px Sans";
 ctx.fillStyle = "rgba(255,255,255,0.75)";
 ctx.fillText(`Tries: ${tries} • Measured: per message.send round-trip (ms)`, 20, 50);

 // draw ping bars area
 const barArea = { x: 24, y: 72, w: width - 48, h: 160 };
 // background box
 ctx.fillStyle = "rgba(255,255,255,0.03)";
 roundRect(ctx, barArea.x - 6, barArea.y - 6, barArea.w + 12, barArea.h + 12, 8, true, false);

 // compute scaling for bars (cap at 1000ms for visual)
 const cap = Math.max(200, Math.max(...pings) * 1.2, 400);
 const barGap = 8;
 const barW = Math.floor((barArea.w - (tries + 1) * barGap) / tries);
 for (let i = 0; i < pings.length; i++) {
 const val = pings[i];
 const bh = Math.max(6, Math.round((val / cap) * (barArea.h - 28)));
 const bx = barArea.x + barGap + i * (barW + barGap);
 const by = barArea.y + (barArea.h - bh) - 10;

 // color by thresholds
 let c = barGood;
 if (val > 300) c = barBad;
 else if (val > 150) c = barWarn;

 ctx.fillStyle = c;
 roundRect(ctx, bx, by, barW, bh, 4, true, false);

 // ping label
 ctx.fillStyle = neutral;
 ctx.font = "10px monospace";
 ctx.textAlign = "center";
 ctx.fillText(`${val}ms`, bx + Math.round(barW / 2), by - 6);
 ctx.textAlign = "start";
 }

 // stats panel right side
 const sX = 420;
 const sY = 68;
 ctx.fillStyle = "rgba(255,255,255,0.9)";
 ctx.font = "13px Sans";
 ctx.fillText(`Average: ${avg.toFixed(1)} ms`, sX, sY + 14);
 ctx.fillText(`Min: ${min} ms`, sX, sY + 36);
 ctx.fillText(`Max: ${max} ms`, sX, sY + 58);
 ctx.fillText(`Jitter: ${jitter.toFixed(1)} ms`, sX, sY + 80);

 // small sparkline of pings below
 const sparkX = sX;
 const sparkY = sY + 110;
 const sparkW = 190;
 const sparkH = 40;
 ctx.strokeStyle = "rgba(255,255,255,0.12)";
 ctx.lineWidth = 1;
 roundRect(ctx, sparkX - 6, sparkY - 6, sparkW + 12, sparkH + 12, 6, true, false);
 // draw sparkline
 ctx.beginPath();
 for (let i = 0; i < pings.length; i++) {
 const px = sparkX + Math.round((i / (pings.length - 1 || 1)) * sparkW);
 const py = sparkY + sparkH - Math.round((Math.min(pings[i], cap) / cap) * sparkH);
 if (i === 0) ctx.moveTo(px, py);
 else ctx.lineTo(px, py);
 }
 ctx.strokeStyle = barGood;
 ctx.lineWidth = 2;
 ctx.stroke();

 // bottom stats: host CPU load and memory (light)
 ctx.fillStyle = "rgba(255,255,255,0.8)";
 ctx.font = "10px Sans";
 const load = os.loadavg ? os.loadavg()[0].toFixed(2) : "n/a";
 const memUsed = ((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(0);
 const memTotal = (os.totalmem() / 1024 / 1024).toFixed(0);
 ctx.fillText(`Host Load(1m): ${load} • RAM: ${memUsed}MB / ${memTotal}MB`, 20, height - 28);

 // author right bottom
 ctx.textAlign = "right";
 ctx.fillStyle = accent;
 ctx.font = "11px Sans";
 ctx.fillText("Chitron Bhattacharjee ✨🌸", width - 20, height - 12);

 // --- Save & reply ---
 const tmpDir = path.join(__dirname, "cache");
 await fs.ensureDir(tmpDir);
 const fileName = `ping-report-${Date.now()}.png`;
 const filePath = path.join(tmpDir, fileName);
 const buffer = canvas.toBuffer("image/png");
 await fs.writeFile(filePath, buffer);

 // reply with image and a short body
 await message.reply({
 body: `📶 Ping report — avg ${avg.toFixed(1)} ms • tries ${tries}`,
 attachment: fs.createReadStream(filePath)
 });

 } catch (err) {
 console.error("Ping command error:", err);
 await message.reply("❌ | Ping command failed.");
 }

 // small helper functions
 function roundRect(ctx, x, y, w, h, r, fill, stroke) {
 if (w < 2 * r) r = w / 2;
 if (h < 2 * r) r = h / 2;
 ctx.beginPath();
 ctx.moveTo(x + r, y);
 ctx.arcTo(x + w, y, x + w, y + h, r);
 ctx.arcTo(x + w, y + h, x, y + h, r);
 ctx.arcTo(x, y + h, x, y, r);
 ctx.arcTo(x, y, x + w, y, r);
 ctx.closePath();
 if (fill) ctx.fill();
 if (stroke) ctx.stroke();
 }
 }
};
<div style="text-align: center;"><div style="position:relative; top:0; margin-right:auto;margin-left:auto; z-index:99999">

</div></div>
