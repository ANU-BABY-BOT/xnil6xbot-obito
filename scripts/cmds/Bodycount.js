const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

function deterministicCount(uid) {
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = uid.charCodeAt(i) + ((hash << 5) - hash);
  }
  return (Math.abs(hash) % 20) + 1; // Body count between 1-20
}

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

module.exports = {
  config: {
    name: "bodycount",
    version: "1.0",
    author: "Chitron Bhattacharjee",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Generate red line body count meme" },
    description: { en: "Draw lines above head showing number of partners" },
    category: "fun",
    guide: { en: "+bodycount [mention] or reply to a user" }
  },

  onStart: async function ({ event, message, usersData }) {
    // Detect UID from reply, mention or self
    const uid =
      event.type === "message_reply"
        ? event.messageReply.senderID
        : (event.mentions && Object.keys(event.mentions)[0]) || event.senderID;

    const userData = await usersData.get(uid);
    const name = userData?.name || "User";
    const avatarURL = `https://graph.facebook.com/${uid}/picture?width=512&height=512`;
    const avatarPath = path.join(__dirname, "cache", `${uid}_avatar.png`);

    // Download avatar
    const response = await axios.get(avatarURL, { responseType: "arraybuffer" });
    await fs.ensureDir(path.join(__dirname, "cache"));
    fs.writeFileSync(avatarPath, Buffer.from(response.data, "binary"));

    // Setup canvas
    const canvas = createCanvas(700, 700);
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load avatar
    const avatar = await loadImage(avatarPath);
    ctx.save();
    ctx.beginPath();
    ctx.arc(350, 500, 100, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 250, 400, 200, 200);
    ctx.restore();

    // Determine fixed body count
    const count = deterministicCount(uid);
    const uidSeed = parseInt(uid.replace(/\D/g, "")) || uid.length;

    // Draw red lines
    for (let i = 0; i < count; i++) {
      const seed = uidSeed + i;
      const startX = seededRandom(seed) * canvas.width;
      const ctrlX = (startX + 350) / 2;
      const ctrlY = seededRandom(seed + 999) * 300;

      ctx.beginPath();
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.moveTo(startX, 0);
      ctx.quadraticCurveTo(ctrlX, ctrlY, 350, 400);
      ctx.stroke();
    }

    // Add bottom text
    ctx.fillStyle = "red";
    ctx.font = "bold 36px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`Body Count: ${count}`, 350, 680);

    // Save & send
    const finalPath = path.join(__dirname, "cache", `${uid}_bodycount.png`);
    const out = fs.createWriteStream(finalPath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on("finish", () => {
      message.reply({
        body: `🔴 Here's the body count of ${name}`,
        attachment: fs.createReadStream(finalPath)
      });
    });
  }
};
