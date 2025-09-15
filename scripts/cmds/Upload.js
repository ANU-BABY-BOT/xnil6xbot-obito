const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const FormData = require("form-data");

module.exports = {
  config: {
    name: "upload",
    version: "1.0",
    author: "Chitron Bhattacharjee",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Upload a file to file.io" },
    description: { en: "Share files via file.io (self-destruct after download)" },
    category: "tools",
    guide: { en: "{pn} [days] (reply to a file)" }
  },

  onStart: async function ({ api, event, message, args }) {
    try {
      const attachments = event.messageReply?.attachments || event.attachments;
      if (!attachments || attachments.length === 0) {
        return message.reply("📂 Please reply to a file to upload.");
      }

      // Expiry days (default: 14)
      let expiryDays = parseInt(args[0]);
      if (isNaN(expiryDays) || expiryDays <= 0) expiryDays = 14;

      const fileUrl = attachments[0].url;
      const fileExt = path.extname(fileUrl.split("?")[0]) || ".bin";

      // Generate random filename
      const randomName = Math.random().toString(36).substring(2, 10) + fileExt;
      const tempPath = path.join(__dirname, "cache", randomName);

      // Download file
      const res = await axios.get(fileUrl, { responseType: "arraybuffer" });
      fs.ensureDirSync(path.join(__dirname, "cache"));
      fs.writeFileSync(tempPath, res.data);

      // Prepare form data
      const form = new FormData();
      form.append("file", fs.createReadStream(tempPath));

      // Upload to file.io
      const uploadRes = await axios.post(
        `https://file.io/?expires=${expiryDays}d`,
        form,
        { headers: form.getHeaders() }
      );

      fs.unlinkSync(tempPath); // remove temp file

      if (uploadRes.data.success) {
        message.reply(
          `✅ **Uploaded Successfully!**\n` +
          `📄 **Random Name:** ${randomName}\n` +
          `🔗 **Link:** ${uploadRes.data.link}\n` +
          `⏳ **Expires in:** ${uploadRes.data.expiry}`
        );
      } else {
        message.reply("❌ Upload failed: " + JSON.stringify(uploadRes.data));
      }
    } catch (err) {
      console.error(err);
      message.reply("❌ Error uploading file.");
    }
  }
};
