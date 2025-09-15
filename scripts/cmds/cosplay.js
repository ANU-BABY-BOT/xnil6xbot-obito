const axios = require('axios');
const fs = require('fs');
const path = require('path');

const tempDir = 'temp';
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

const cosplayImages = [
  "https://files.catbox.moe/v52rp9.jpg",
  "https://files.catbox.moe/abcd12.jpg",
  "https://files.catbox.moe/xyz345.jpg"
  "https://files.catbox.moe/wzowmg.jpg"
  "https://files.catbox.moe/j58sx9.jpeg"
  "https://files.catbox.moe/r9waun.jpeg"
  "https://files.catbox.moe/ejh2w1.jpeg"
  "https://files.catbox.moe/be1ebb.jpeg"
  "https://files.catbox.moe/flhu5q.jpeg"
  "https://files.catbox.moe/d11vbn.jpeg"
  "https://files.catbox.moe/fidqnw.jpeg"
 "https://files.catbox.moe/8o2hzv.jpg"
"https://files.catbox.moe/60bsmb.jpeg"
"https://files.catbox.moe/d11vbn.jpeg"
"https://files.catbox.moe/d11vbn.jpeg"
"https://files.catbox.moe/go08sc.jpeg"
"https://files.catbox.moe/8tid4t.jpeg"
"https://files.catbox.moe/y3y9jn.jpeg"
"https://files.catbox.moe/y3y9jn.jpeg"
"https://files.catbox.moe/el0hkg.jpeg"
"https://files.catbox.moe/s1rupx.jpeg"
"https://files.catbox.moe/sgsr1c.jpeg"
"https://files.catbox.moe/nscbm0.jpeg"
"https://files.catbox.moe/8w8xxr.jpeg"
"https://files.catbox.moe/s27xwz.jpeg"
"https://files.catbox.moe/t3cvel.jpeg"
"https://files.catbox.moe/w9mzor.jpeg"
"https://files.catbox.moe/fpm3ot.jpeg"
"https://files.catbox.moe/a6p47r.jpeg"
"https://files.catbox.moe/3h01vv.jpeg"
"https://files.catbox.moe/3h01vv.jpeg"
"https://files.catbox.moe/w3n9gv.jpeg"
];

module.exports = {
  config: {
    name: "cosplay",
    version: "1.5",
    author: "KSHITIZ",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Random cosplay image" },
    longDescription: { en: "Sends a random cosplay image from a fixed set" },
    category: "anime",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ message }) {
    try {
      const randomIndex = Math.floor(Math.random() * cosplayImages.length);
      const imageUrl = cosplayImages[randomIndex];

      const imageName = `cosplay_${Date.now()}.jpg`;
      const imagePath = path.join(tempDir, imageName);

      const response = await axios.get(imageUrl, { responseType: 'stream' });
      const writer = fs.createWriteStream(imagePath);
      response.data.pipe(writer);

      writer.on('finish', () => {
        message.reply({
          body: "✨ Here's a random cosplay image!",
          attachment: fs.createReadStream(imagePath)
        }).then(() => fs.unlinkSync(imagePath));
      });

      writer.on('error', () => {
        message.reply("❌ Failed to save image.");
      });

    } catch (error) {
      console.error("Error sending cosplay image:", error);
      message.reply("❌ Something went wrong. Please try again later.");
    }
  }
};
