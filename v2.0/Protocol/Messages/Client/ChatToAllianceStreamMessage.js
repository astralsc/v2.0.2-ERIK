const PiranhaMessage = require("../../PiranhaMessage");
const KeepAliveOkMessage = require("../Server/KeepAliveOkMessage");

class ChatToAllianceStreamMessage extends PiranhaMessage {
  constructor(bytes, client) {
    super(bytes);
    this.id = 14315;
    this.client = client;
    this.version = 0;
  }

  decode() {
    this.message = this.readString();
  }

  async process() {
    if (this.message.length === 5) {
      if (this.message.startsWith(".") && this.message.endsWith("U")) {
        if (this.client.battle) {
          this.client.battle.setCrowns(
            this.client,
            parseInt(this.message.charAt(1)),
          );
        }
      }
    }
    if (this.message.startsWith("updateID-")) {
      console.log(this.message);
      this.client.updateID = parseInt(this.message.replace("updateID-", ""));
    }
  }
}

module.exports = ChatToAllianceStreamMessage;
