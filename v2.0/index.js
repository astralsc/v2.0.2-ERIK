const net = require("net");
const MessageFactory = require("./Protocol/MessageFactory");
const server = new net.Server();
const Messages = new MessageFactory();
const Crypto = require("./ByteStream/Crypto");
const figlet = require("figlet");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
global.CONTENT_SERVER_PORT = 9340;
const express = require("express");
const contentPatchServer = express();
const Hash = require("crypto");
var morgan = require("morgan");
const Database = require("./database");

const discordbot = require("./DiscordBot/index");

global.updateID = 1;

global.database = new Database("database.json");

for (const plr of global.database.getAll()) {
  console.log(plr);
  if (Date.now() - plr.lastLogin > 10 * 24 * 60 * 60 * 1000) {
    global.database.delete(plr._systemid);
  }
}

contentPatchServer.use(morgan("dev"));

const gamefilesDir = path.join(__dirname, "Gamefiles");
const fingerprintPath = path.join(gamefilesDir, "fingerprint.json");

// Load fingerprint
if (fs.existsSync(fingerprintPath)) {
  global.fingerprint = JSON.parse(fs.readFileSync(fingerprintPath, "utf8"));
} else {
  global.fingerprint = { files: [] };
}

if (!global.fingerprint.files) {
  global.fingerprint.files = [];
}

// Recursively collect all files
function getAllFiles(dir, baseDir = dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, baseDir));
    } else if (entry.isFile()) {
      const relativePath = path.relative(baseDir, fullPath);

      if (relativePath !== "fingerprint.json") {
        results.push(relativePath);
      }
    }
  }

  return results;
}

const actualFiles = getAllFiles(gamefilesDir);

// Add new files automatically
for (const filePath of actualFiles) {
  const exists = global.fingerprint.files.find((f) => f.file === filePath);

  if (!exists) {
    global.fingerprint.files.push({
      file: filePath,
      sha: "",
    });
  }
}

let allshas = "";

// Update hashes + remove deleted files
global.fingerprint.files = global.fingerprint.files.filter((fileObj) => {
  const fullPath = path.join(gamefilesDir, fileObj.file);

  if (!fs.existsSync(fullPath)) {
    return false;
  }

  const fileBuffer = fs.readFileSync(fullPath);
  const hashhex = Hash.createHash("sha1").update(fileBuffer).digest("hex");

  fileObj.sha = hashhex;
  allshas += hashhex;

  return true;
});

// Generate global fingerprint hash
global.fingerprint.sha = Hash.createHash("sha1").update(allshas).digest("hex");

global.fingerprintSha = global.fingerprint.sha;

// Replace "/" like your original script
global.fingerprintString = JSON.stringify(global.fingerprint)
  .replace(
    new RegExp(Buffer.from("XFw=", "base64").toString("utf-8"), "g"),
    "/",
  )
  .replace(/\//g, Buffer.from("XC8=", "base64").toString("utf-8"));

console.log(global.fingerprintString);

// Save updated fingerprint
fs.writeFileSync(fingerprintPath, JSON.stringify(global.fingerprint, null, 2));

global.fingerprintString = JSON.stringify(global.fingerprint).replace(
  new RegExp("/", "g"),
  Buffer.from("XC8=", "base64").toString("utf-8"),
);

console.log(global.fingerprintString);

fs.writeFileSync("Gamefiles/fingerprint.json", global.fingerprintString);

global.rootPath = __dirname;

contentPatchServer.use(
  "/" + fingerprint.sha,
  express.static(path.join(global.rootPath, "Gamefiles")),
);

contentPatchServer.listen(global.CONTENT_SERVER_PORT, () => {
  console.log(
    "content patch server started at port " + global.CONTENT_SERVER_PORT,
  );
});

global.newUserId = 0;

if (fs.existsSync(path.join(global.rootPath, "newUserId.txt"))) {
  global.newUserId = parseInt(
    fs.readFileSync(path.join(global.rootPath, "newUserId.txt"), "utf-8"),
  );
}

global.userInBattleSeach = null;

//require("./Database/database");

const PORT = 9339;

global.connectedPlayers = [];

server.on("connection", async (client) => {
  client.setNoDelay(true);
  client.log = function (text) {
    return console.log(
      `[${this.remoteAddress.split(":").slice(-1)}] >> ${text}`,
    );
  };

  global.connectedPlayers.push(client);

  client.crypto = new Crypto();

  client.log("A wild connection appeard!");

  const packets = Messages.getPackets();

  client.on("data", async (data) => {
      let message = {
        id: data.readUInt16BE(0),
        len: data.readUIntBE(2, 3),
        version: data.readUInt16BE(5),
        payload: data.slice(7, this.len),
        client,
      };

      message.payload = client.crypto.decrypt(message);

      if (packets.indexOf(String(message.id)) !== -1) {
        try {
          const packet = new (Messages.handle(message.id))(
            message.payload,
            client,
          );

          //if (this.id < 10097) {
          client.log(
            `Gotcha ${message.id} (${packet.constructor.name}) packet! `,
          );
          //}

          await packet.decode();
          await packet.process();
        } catch (e) {
          console.log(e);
        }
      } else {
        // client.log(`Gotcha undefined ${message.id} packet!`);
      }
  });

  client.on("end", async () => {
    global.connectedPlayers.splice(global.connectedPlayers.indexOf(client));
    if (this.userInBattleSeach == client) {
      this.userInBattleSeach = null;
    }
    return client.log("Client disconnected.");
  });

  client.on("error", async (error) => {
    global.connectedPlayers.splice(global.connectedPlayers.indexOf(client));
    if (this.userInBattleSeach == client) {
      this.userInBattleSeach = null;
    }
    try {
      client.log("A wild error!");
      console.log(error);
      client.destroy();
    } catch (e) {}
  });
});

server.once("listening", () => {
  console.clear();
  const text = figlet.textSync("Eriks Royale v2.0");
  console.log(text);
  console.log(`[SERVER] >> Server started on ${PORT} port!`);
});
server.listen(PORT);

process.on("uncaughtException", (e) => console.log(e));

process.on("unhandledRejection", (e) => console.log(e));

async function getGlobalIPv4() {
  try {
    // Try ipify first
    const response = await axios.get("https://api.ipify.org", {
      params: { format: "json" },
    });
    return response.data.ip;
  } catch (error) {
    // Fallback to another service
    try {
      const response = await axios.get("https://api.myip.com");
      return response.data.ip;
    } catch (fallbackError) {
      throw new Error("Could not fetch global IP: " + error.message);
    }
  }
}

// Usage with async/await
(async () => {
  try {
    const ip = await getGlobalIPv4();
    console.log("Your global IPv4 address is:", ip);
    global.globalIPV4 = ip;
  } catch (error) {
    console.error("Error:", error.message);
  }
})();

global.playerCount = 0;

setInterval(() => {
  server.getConnections((err, count) => {
    if (err) {
      console.error(err);
      return;
    }
    global.playerCount = count;
    console.log("Player Count: " + count);
  });
}, 5000);
