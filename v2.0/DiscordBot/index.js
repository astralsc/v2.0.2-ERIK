// Import the Dysnomia library
const Dysnomia = require("@projectdysnomia/dysnomia");

// Replace with your bot token
const TOKEN =
  "your-token-here";

// Create a new bot instance with intents
const bot = new Dysnomia.Client(TOKEN, {
  gateway: {
    intents: ["guilds", "guildMessages", "messageContent"],
  },
});

// When bot is ready
bot.on("ready", () => {
  console.log(`Logged in as ${bot.user.username}#${bot.user.discriminator}`);
  global.sendDiscordMessage = (message) => {
    bot.createMessage("1473719958042316820", message);
  };
});

// Listen for incoming messages
// bot.on("messageCreate", (msg) => {
//   // Ignore bots
//   if (msg.author.bot) return;

//   // Simple ping command
//   if (msg.content === "!ping") {
//     sendMessageToChannel(msg.channel.id, "Pong!");
//   }

//   // Example: send message from command
//   if (msg.content.startsWith("!say ")) {
//     const content = msg.content.slice(5).trim();
//     sendMessageToChannel(msg.channel.id, content);
//   }
// });

bot.on("error", console.error);
bot.on("disconnect", console.error);
bot.on("shardDisconnect", console.error);

// Connect the bot to Discord
bot.connect();

module.exports = bot;
