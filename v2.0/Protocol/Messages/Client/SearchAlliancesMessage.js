const PiranhaMessage = require("../../PiranhaMessage");
const ServerErrorMessage = require("../Server/ServerErrorMessage");

function getusedmemeorymb() {
  const memoryUsage = process.memoryUsage();
  const heapUsedBytes = memoryUsage.heapUsed;
  const heapUsedMB = heapUsedBytes / 1024 / 1024;
  return parseFloat(heapUsedMB.toFixed(2));
}

class SeachAlliancesMessage extends PiranhaMessage {
  constructor(bytes, client) {
    super(bytes);
    this.id = 14324;
    this.client = client;
    this.version = 0;
    this.searchQuery = "";
  }

  decode() {
    this.searchQuery = this.readString();
    /*let length = this.readInt();
    let bytes = "";
    if (length > 0) {
      for (let i = 0; i < length; i++) {
        bytes += this.readByte().toString(16);
      }
      this.searchQuery = Buffer.from(bytes, "hex").toString("utf-8");
    }*/
  }

  async process() {
    console.log(this.searchQuery);
    if (this.searchQuery === "/status") {
      await new ServerErrorMessage(
        this.client,
        `players: ${global.playerCount}
Used Memory: ${getusedmemeorymb()} MB`,
      ).send();
    }
  }
}

module.exports = SeachAlliancesMessage;
