const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "ctchart",
    version: "1.0",
    author: "Chitron Bhattacharjee",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Generate quick bar chart from numbers" },
    description: { en: "Enter datasets separated by '-' and get a bar chart." },
    category: "tools",
    guide: {
      en: "{pn} <dataset1> - <dataset2> - ...\nExample:\n+ctchart 50 60 70 80 - 70 200 160 39"
    }
  },

  onStart: async function({ message, args }) {
    try {
      if (!args || args.length === 0) return message.reply("❌ Please provide numbers separated by spaces, use '-' for multiple datasets.");

      const argStr = args.join(" ");
      const datasetStrings = argStr.split("-").map(d => d.trim());

      const datasets = datasetStrings.map((ds, i) => {
        const numbers = ds.split(/\s+/).map(n => parseFloat(n)).filter(n => !isNaN(n));
        return {
          label: `Dataset ${i + 1}`,
          data: numbers
        };
      });

      if (datasets.some(ds => ds.data.length === 0)) return message.reply("❌ Invalid numbers in datasets.");

      // Generate labels based on max dataset length
      const maxLen = Math.max(...datasets.map(d => d.data.length));
      const labels = Array.from({ length: maxLen }, (_, i) => `Q${i + 1}`);

      // Build chart config
      const chartConfig = {
        type: "bar",
        data: { labels, datasets }
      };

      const chartUrl = `https://quickchart.io/chart?bkg=white&c=${encodeURIComponent(JSON.stringify(chartConfig))}`;

      // Download chart image
      const fileName = `chart_${Date.now()}.png`;
      const filePath = path.join(__dirname, "cache", fileName);
      const res = await axios.get(chartUrl, { responseType: "arraybuffer" });
      fs.ensureDirSync(path.join(__dirname, "cache"));
      fs.writeFileSync(filePath, res.data);

      await message.reply({
        body: `📊 Chart generated!\n🔗 URL: ${chartUrl}`,
        attachment: fs.createReadStream(filePath)
      });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error(err);
      message.reply("❌ Error generating chart.");
    }
  }
};
