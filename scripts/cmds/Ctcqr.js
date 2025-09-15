const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
	config: {
		name: "ctqr",
		version: "1.0",
		author: "Chitron Bhattacharjee",
		countDown: 5,
		role: 0,
		shortDescription: {
			en: "Generate QR code from text or URL"
		},
		description: {
			en: "Create a QR code using qrtag.net API with options for transparency, size, and format."
		},
		category: "tools",
		guide: {
			en: "{pn} [-t] [-s size] [-svg] <text or URL>\n\nOptions:\n -t → Transparent background\n -s <number> → Pixel size (default 4)\n -svg → Output in SVG format"
		}
	},

	onStart: async function ({ message, args }) {
		try {
			if (args.length === 0) {
				return message.reply("❌ Please provide text or a URL to generate QR code.");
			}

			// Default options
			let transparent = false;
			let size = 4; // pixel size default
			let format = "png";
			let targetText = "";

			// Parse args
			for (let i = 0; i < args.length; i++) {
				const arg = args[i].toLowerCase();
				if (arg === "-t") transparent = true;
				else if (arg === "-svg") format = "svg";
				else if (arg === "-s" && !isNaN(parseInt(args[i + 1]))) {
					size = parseInt(args[i + 1]);
					i++;
				} else {
					targetText += args[i] + " ";
				}
			}

			targetText = targetText.trim();
			if (!targetText) return message.reply("❌ Please provide valid text or URL.");

			// Build qrtag API link
			let qrUrl = `https://qrtag.net/api/qr`;
			if (transparent) qrUrl += `_transparent`;
			if (size) qrUrl += `_${size}`;
			qrUrl += `.${format}?url=${encodeURIComponent(targetText)}`;

			// Download QR code
			const fileName = `qr_${Date.now()}.${format}`;
			const filePath = path.join(__dirname, "cache", fileName);
			const res = await axios.get(qrUrl, { responseType: "arraybuffer" });
			fs.ensureDirSync(path.join(__dirname, "cache"));
			fs.writeFileSync(filePath, res.data);

			// Send reply with QR attachment
			await message.reply({
				body: `✅ QR Code Generated!\n🔗 Content: ${targetText}\n🎨 Transparent: ${transparent}\n📏 Pixel Size: ${size}\n📄 Format: ${format.toUpperCase()}`,
				attachment: fs.createReadStream(filePath)
			});

			fs.unlinkSync(filePath); // cleanup
		} catch (err) {
			console.error(err);
			message.reply("❌ Error generating QR code.");
		}
	}
};
