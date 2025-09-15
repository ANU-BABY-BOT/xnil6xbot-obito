const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "noti2",
    version: "1.0",
    author: "Chitron Bhattacharjee",
    countDown: 10,
    role: 1,
    shortDescription: {
      en: "Send canvas-style text notice to all groups"
    },
    description: {
      en: "Create a styled canvas image with your message and send to all group chats"
    },
    category: "utility",
    guide: {
      en: "{pn} your notice text"
    }
  },

  onStart: async function ({
    api, args, message, event, threadsData, usersData
  }) {
    const text = args.join(" ");
    if (!text) return message.reply("❌ Please enter a notice text.\nExample:\n+noti2 Meeting at 9PM!");

    const senderName = await usersData.getName(event.senderID);
    const fileName = `${event.senderID}_${Date.now()}.png`;
    const filePath = path.join(__dirname, "tmp", fileName);
    fs.ensureDirSync(path.join(__dirname, "tmp"));

    // Canvas settings
    const width = 900;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#a6d3ff");
    gradient.addColorStop(1, "#d6ecff");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Text styling
    ctx.fillStyle = "#003366";
    ctx.font = "bold 40px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const maxWidth = width - 100;
    const lines = wrapText(ctx, text, maxWidth);
    const lineHeight = 50;
    const totalHeight = lines.length * lineHeight;
    let y = (height - totalHeight) / 2;

    lines.forEach(line => {
      ctx.fillText(line, width / 2, y);
      y += lineHeight;
    });

    // Save image
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(filePath, buffer);

    // Fetch all threads
    const allThreads = await threadsData.getAll();
    const groupThreads = allThreads.filter(t => t.threadID != event.threadID && t.members && t.members.length > 2);

    const caption = `🗣️ ${senderName}`;
    let sentCount = 0;

    for (const thread of groupThreads) {
      try {
        await api.sendMessage({
          body: caption,
          attachment: fs.createReadStream(filePath)
        }, thread.threadID);
        sentCount++;
      } catch (e) { /* skip failed */ }
    }

    await message.reply(`✅ Notification sent to ${sentCount} groups.`);
    fs.unlinkSync(filePath);
  }
};

// Helper function to wrap text
function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && i > 0) {
      lines.push(line.trim());
      line = words[i] + " ";
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());
  return lines;
}
